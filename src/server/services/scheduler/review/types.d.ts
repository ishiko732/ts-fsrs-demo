import 'server-only'

import type cardModel from '@server/models/cards'
import type { RevlogTable } from '@server/models/revlog'
import type { Insertable } from 'kysely'
import type { fsrs } from 'ts-fsrs'

class ReviewService {
  private createForgetLog(): Insertable<RevlogTable> {
    return {
      create: {
        grade: Rating[recordLogItem.log.rating] as PrismaRating,
        state: State[recordLogItem.log.state] as PrismaState,
        due: recordLogItem.log.due,
        stability: recordLogItem.log.stability,
        difficulty: recordLogItem.log.difficulty,
        elapsed_days: recordLogItem.log.elapsed_days,
        last_elapsed_days: recordLogItem.log.last_elapsed_days,
        scheduled_days: recordLogItem.log.scheduled_days,
        review: recordLogItem.log.review,
        duration: 0,
      },
    }
  }

  async forget(uid: number, cid: number) {
    const cardInfo = await cardModel.db.selectFrom(cardModel.table).where('cards.id', cid).where('cards.uid', uid).executeTakeFirstOrThrow()
    const deckInfo = await deckModel.db.selectFrom(deckModel.table).where('decks.id', cardInfo.did).executeTakeFirstOrThrow()

    const f = fsrs(deckInfo.fsrs)

  }
}
