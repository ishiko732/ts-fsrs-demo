import 'client-only'

import type { TCardDetail } from '@server/services/decks/cards'
import { fsrs, type FSRSParameters, State } from 'ts-fsrs'

const f = fsrs()

export function createReviewSnapshot(cardDetail: TCardDetail, params: FSRSParameters, now: number | Date = new Date()) {
  // get current DSR
  let DSR
  if (cardDetail.state === State.Review) {
    const r = fsrs().get_retrievability(cardDetail, now, true)
    DSR = {
      D: cardDetail.difficulty,
      S: cardDetail.stability,
      R: r,
    }
  }
  f.parameters = params
  return {
    preview: f.repeat(cardDetail, now),
    DSR,
  }
}
