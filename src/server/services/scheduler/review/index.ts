import 'server-only'

import { db } from '@server/libs/db'
import type { Database } from '@server/models'
import cardModel, { type CardTable } from '@server/models/cards'
import deckModel from '@server/models/decks'
import { revlogModel, type RevlogTable } from '@server/models/revlog'
import type { CardServiceType } from '@server/services/decks/cards'
import type { ExpressionBuilder, Insertable, Updateable } from 'kysely'
import { sql } from 'kysely'
import { fsrs, type RecordLogItem, State } from 'ts-fsrs'

class ReviewService {
  async forget(uid: number, cid: number, timestamp: number, offset: number, reset_count: boolean = false) {
    const cardInfo = await cardModel.db
      .selectFrom(cardModel.table)
      .selectAll()
      .where('cards.id', '=', cid)
      .where('cards.uid', '=', uid)
      .executeTakeFirstOrThrow()
    const deckInfo = await deckModel.db
      .selectFrom(deckModel.table)
      .select('fsrs')
      .where('decks.id', '=', cardInfo.did)
      .executeTakeFirstOrThrow()

    const f = fsrs(deckInfo.fsrs)

    const { card, log } = f.forget(cardInfo, timestamp, reset_count, (recordItem: RecordLogItem) => {
      const data = {
        card: {
          ...recordItem.card,
          due: +recordItem.card.due,
          last_review: recordItem.card.last_review?.getTime() || undefined,
          updated: +timestamp,
        } satisfies Updateable<CardTable>,
        log: {
          ...recordItem.log,
          grade: recordItem.log.rating,
          due: +recordItem.log.due,
          review: +recordItem.log.review,

          cid: cardInfo.id,
          did: cardInfo.did,
          uid: cardInfo.uid,
          deleted: false,
          duration: 0,
          offset: offset,
        } satisfies Insertable<RevlogTable>,
      }

      Reflect.deleteProperty(data.log, 'rating') // rating -> grade
      return data
    })

    await cardModel.db.transaction().execute(async (trx) => {
      await trx.updateTable(cardModel.table).set(card).where('id', '=', cid).execute()

      await trx.insertInto(revlogModel.table).values(log).execute()
    })

    return {
      next_state: card.state,
      next_due: card.due,

      uid: cardInfo.uid,
      did: cardInfo.did,
      nid: cardInfo.nid,
    }
  }

  async switch_suspend(uid: number, cid: number, timestamp: number, suspended: boolean) {
    const cardInfo = await cardModel.db
      .selectFrom(cardModel.table)
      .selectAll()
      .where('cards.id', '=', cid)
      .where('cards.uid', '=', uid)
      .executeTakeFirstOrThrow()

    await cardModel.db
      .updateTable(cardModel.table)
      .set({
        suspended,
        updated: +timestamp,
      })
      .where('id', '=', cid)
      .execute()

    return {
      next_state: cardInfo.state,
      next_due: cardInfo.due,
      suspended,

      uid: cardInfo.uid,
      did: cardInfo.did,
      nid: cardInfo.nid,
    }
  }
  async getReviewCardDetails(uid: number, end_timestamp: number, dids: number[] = []) {
    const sub_query = (eb: ExpressionBuilder<Database, never>) =>
      eb
        .selectFrom('cards as c')
        .innerJoin('decks as d', 'd.id', 'c.did')
        .selectAll('c')
        .select([
          sql<number>`ROW_NUMBER() OVER (
            PARTITION BY c.did, c.state
            ORDER BY c.id)`.as('rn'),
          sql<number>`CASE c.state
            WHEN ${State.New} THEN (d.card_limit->>'new')::INT
            WHEN ${State.Review} THEN (d.card_limit->>'review')::INT
            WHEN ${State.Learning} THEN (d.card_limit->>'learning')::INT
            WHEN ${State.Relearning} THEN (d.card_limit->>'learning')::INT
          END`.as('state_limit'),
        ])
        .where((eb) =>
          eb.or([
            eb.and([eb('c.state', 'in', [State.Review]), eb('c.due', '<', end_timestamp)]),
            eb.and([eb('c.state', 'not in', [State.Review])]),
          ]),
        )
        .where('c.uid', '=', uid)
        .where('c.deleted', '=', false)
        .where('c.suspended', '=', false)
        .where('d.deleted', '=', false)
        .$if(Array.isArray(dids) && dids.length > 0, (q) => q.where('c.did', 'in', dids))

    const query = db
      .selectFrom((eb) => sub_query(eb).as('sub'))
      .innerJoin('notes as n', 'n.id', 'sub.nid')
      .selectAll()
      .select('sub.id as cid')
      .whereRef('sub.rn', '<=', 'sub.state_limit')

    return query.execute()
  }
  /**
   * Distribute cardDetail based on state.
   */
  distributeCardDetails(cardDetails: Array<Awaited<ReturnType<CardServiceType['getDetail']>>['card']>) {
    const result = new Map<State, Array<Awaited<ReturnType<CardServiceType['getDetail']>>['card']>>([
      [State.New, []],
      [State.Learning, []],
      [State.Relearning, []],
      [State.Review, []],
    ])

    for (const card of cardDetails) {
      result.get(card.state)?.push(card)
    }

    return result
  }
}

export const reviewService = new ReviewService()
export default reviewService
