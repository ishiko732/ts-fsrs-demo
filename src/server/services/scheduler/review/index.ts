import 'server-only'

import cardModel, { type CardTable } from '@server/models/cards'
import deckModel from '@server/models/decks'
import { revlogModel, type RevlogTable } from '@server/models/revlog'
import type { Insertable, Updateable } from 'kysely'
import { fsrs, type RecordLogItem } from 'ts-fsrs'

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
}

export const reviewService = new ReviewService()
export default reviewService
