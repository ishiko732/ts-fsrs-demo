import 'server-only'

import { db } from '@server/libs/db'
import type { Database } from '@server/models'
import cardModel, { type CardTable } from '@server/models/cards'
import deckModel from '@server/models/decks'
import { revlogModel, type RevlogTable } from '@server/models/revlog'
import type { ExpressionBuilder, Insertable, Updateable } from 'kysely'
import { sql } from 'kysely'
import {
  type Card,
  fsrs,
  type FSRSHistory,
  type FSRSParameters,
  generatorParameters,
  type Grade,
  Rating,
  type RecordLogItem,
  State,
} from 'ts-fsrs'

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
          nid: cardInfo.nid,
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
      cid: cardInfo.id,
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
      cid: cardInfo.id,
    }
  }
  async getReviewCardDetails(
    uid: number,
    end_timestamp: number,
    today_count: Map<State, number>,
    options?: Partial<{
      dids: number[]
      source: string[]
    }>,
  ) {
    // default options
    const dids = options?.dids ?? []
    const source = options?.source ?? []

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
            WHEN ${State.New} THEN GREATEST(0::bigint, (d.card_limit->>'new')::BIGINT - ${today_count.get(State.New) ?? 0})
            WHEN ${State.Review} THEN GREATEST(0::bigint,(d.card_limit->>'review')::bigint- ${today_count.get(State.Review) ?? 0})
            WHEN ${State.Learning} THEN GREATEST(0::bigint,(d.card_limit->>'learning')::bigint - ${today_count.get(State.Learning) ?? 0})
            WHEN ${State.Relearning} THEN GREATEST(0::bigint,(d.card_limit->>'learning')::bigint - ${today_count.get(State.Relearning) ?? 0})
          END`.as('state_limit'),
          'd.fsrs',
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
      .$if(Array.isArray(source) && source.length > 0, (q) => q.where('n.source', 'in', source))

    return query.execute()
  }
  /**
   * Distribute cardDetail based on state.
   */
  distributeCardDetails(cardDetails: Array<TReviewCardDetail>) {
    const result = new Map<State, Array<TReviewCardDetail>>([
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

  async getReviewCardDetail(uid: number, cid: number): Promise<TReviewCardDetail> {
    return cardModel.db
      .selectFrom('cards as c')
      .innerJoin('decks as d', 'd.id', 'c.did')
      .innerJoin('notes as n', 'n.id', 'c.nid')
      .selectAll(['c', 'n'])
      .select([
        sql<number>`ROW_NUMBER() OVER (
          PARTITION BY c.did, c.state
          ORDER BY c.id)`.as('rn'),
        sql<number>`CASE c.state
          WHEN ${State.New} THEN (d.card_limit->>'new')::bigint
          WHEN ${State.Review} THEN (d.card_limit->>'review')::bigint
          WHEN ${State.Learning} THEN (d.card_limit->>'learning')::bigint
          WHEN ${State.Relearning} THEN (d.card_limit->>'learning')::bigint
        END`.as('state_limit'),
        'd.fsrs',
        'c.id as cid',
      ])
      .where('c.id', '=', cid)
      .where('c.uid', '=', uid)
      .where('c.deleted', '=', false)
      .where('c.suspended', '=', false)
      .where('d.deleted', '=', false)
      .executeTakeFirstOrThrow()
  }

  async next(uid: number, cid: number, timestamp: number, grade: Grade, offset: number, duration: number = 0) {
    const cardInfo = await cardModel.db
      .selectFrom(cardModel.table)
      .innerJoin('decks', 'decks.id', 'cards.did')
      .selectAll('cards')
      .select(['decks.fsrs', 'decks.card_limit'])
      .where('cards.id', '=', cid)
      .where('cards.uid', '=', uid)
      .executeTakeFirstOrThrow()

    const f = fsrs(cardInfo.fsrs)
    const card_limit = cardInfo.card_limit ?? {}
    const lapses = card_limit.suspended ?? 8

    const { card, log } = f.next(cardInfo, timestamp, grade, (recordItem: RecordLogItem) => {
      const suspended = grade === Rating.Again && recordItem.card.lapses > 0 && recordItem.card.lapses % lapses == 0
      const data = {
        card: {
          due: +recordItem.card.due,
          stability: recordItem.card.stability,
          difficulty: recordItem.card.difficulty,
          elapsed_days: recordItem.card.elapsed_days,
          scheduled_days: recordItem.card.scheduled_days,
          reps: recordItem.card.reps,
          lapses: recordItem.card.lapses,
          state: recordItem.card.state,
          last_review: recordItem.card.last_review?.getTime() || undefined,
          suspended: suspended,
          updated: Date.now(),
        } satisfies Updateable<CardTable>,
        log: {
          ...recordItem.log,
          grade: recordItem.log.rating,
          due: +recordItem.log.due,
          review: +recordItem.log.review,

          cid: cardInfo.id,
          did: cardInfo.did,
          nid: cardInfo.nid,
          uid: cardInfo.uid,
          duration: duration,
          offset: offset,
        } satisfies Insertable<RevlogTable>,
      }
      Reflect.deleteProperty(data.log, 'rating') // rating -> grade
      return data
    })

    const log_id = await cardModel.db.transaction().execute(async (trx) => {
      await trx.updateTable(cardModel.table).set(card).where('id', '=', cardInfo.id).execute()

      const result = await trx.insertInto(revlogModel.table).values(log).returning('revlog.id').executeTakeFirstOrThrow()
      return result.id
    })

    return {
      next_state: card.state,
      next_due: card.due,
      suspended: card.suspended,

      uid: cardInfo.uid,
      did: cardInfo.did,
      nid: cardInfo.nid,
      cid: cardInfo.id,
      lid: log_id,
    }
  }

  async undo(uid: number, cid: number, lid: number) {
    const cardInfo = await cardModel.db
      .selectFrom(cardModel.table)
      .innerJoin('decks', 'decks.id', 'cards.did')
      .selectAll('cards')
      .select(['decks.fsrs', 'decks.card_limit'])
      .where('cards.id', '=', cid)
      .where('cards.uid', '=', uid)
      .executeTakeFirstOrThrow()

    const logInfo = await revlogModel.db
      .selectFrom(revlogModel.table)
      .selectAll()
      .where('revlog.cid', '=', cid)
      .where('revlog.id', '=', lid)
      .executeTakeFirstOrThrow()
    // inject rating
    const logInfoWithRating = { ...logInfo, rating: logInfo.grade }
    const f = fsrs(cardInfo.fsrs)
    const card_limit = cardInfo.card_limit ?? {}
    const lapses = card_limit.suspended ?? 8

    const now = Date.now()
    const prev_card = f.rollback(cardInfo, logInfoWithRating, (card: Card) => {
      const suspended = logInfo.grade === Rating.Again && card.lapses > 0 && card.lapses % lapses == 0
      return {
        due: +card.due,
        stability: card.stability,
        difficulty: card.difficulty,
        elapsed_days: card.elapsed_days,
        scheduled_days: card.scheduled_days,
        reps: card.reps,
        lapses: card.lapses,
        state: card.state,
        last_review: card.last_review?.getTime() || undefined,
        suspended,
        updated: now,
      } satisfies Updateable<CardTable>
    })

    await cardModel.db.transaction().execute(async (trx) => {
      const card_promise = trx.updateTable(cardModel.table).set(prev_card).where('id', '=', cid).where('uid', '=', uid).execute()
      const log_promise = trx.updateTable(revlogModel.table).set({ deleted: true }).where('id', '=', lid).where('uid', '=', uid).execute()
      await Promise.all([card_promise, log_promise])
    })

    return {
      next_state: prev_card.state,
      next_due: prev_card.due,

      uid: cardInfo.uid,
      did: cardInfo.did,
      nid: cardInfo.nid,
      cid: cardInfo.id,
    }
  }

  async reschedule(uid: number, cids: number[], useParams?: FSRSParameters) {
    const cards_promise = cardModel.db
      .selectFrom(cardModel.table)
      .selectAll()
      .where('uid', '=', uid)
      .where('deleted', '=', false)
      .where('id', 'in', cids)
      .execute()
    const logs_promise = revlogModel.db
      .selectFrom(revlogModel.table)
      .selectAll()
      .where('uid', '=', uid)
      .where('deleted', '=', false)
      .where('cid', 'in', cids)
      .execute()
    const [cards, logs] = await Promise.all([cards_promise, logs_promise])
    const logsMap = new Map<number, FSRSHistory[]>()
    for (const log of logs) {
      if (!logsMap.has(log.cid)) {
        logsMap.set(log.cid, [])
      }
      logsMap.get(log.cid)!.push({
        rating: log.grade,
        review: log.review,
        due: new Date(log.due),
        state: log.state,
      })
    }

    const f = fsrs()
    const deckIds = new Set<number>(cards.map((card) => card.did))
    const deckMap = new Map<number, FSRSParameters>()
    if (!useParams) {
      const decks = await deckModel.db
        .selectFrom(deckModel.table)
        .select(['fsrs', 'id'])
        .where('id', 'in', Array.from(deckIds))
        .where('deleted', '=', false)
        .execute()
      for (const deck of decks) {
        deckMap.set(deck.id, deck.fsrs)
      }
    } else {
      for (const deckId of deckIds) {
        deckMap.set(deckId, useParams)
      }
    }
    const updatedCardIds: number[] = []
    for (const card of cards) {
      f.parameters = deckMap.get(card.did) ?? generatorParameters()
      const logs = logsMap.get(card.id) ?? []
      const record = f.reschedule(card, logs)
      if (record.reschedule_item) {
        updatedCardIds.push(card.id)
        await cardModel.db
          .updateTable(cardModel.table)
          .set({
            stability: record.reschedule_item.card.stability,
            difficulty: record.reschedule_item.card.difficulty,
            due: +record.reschedule_item.card.due,
            updated: Date.now(),
          })
          .where('id', '=', card.id)
          .execute()
      }
    }
    return updatedCardIds
  }
}

export const reviewService = new ReviewService()
export type ReviewServiceType = typeof reviewService
export type TReviewCardDetail = Awaited<ReturnType<ReviewServiceType['getReviewCardDetails']>>[number]
export default reviewService
