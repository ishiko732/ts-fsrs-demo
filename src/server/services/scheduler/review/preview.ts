import 'client-only'

import type { TCardDetail } from '@server/services/decks/cards'
import { type FSRSParameters, fsrs, State } from 'ts-fsrs'

const f = fsrs()

export function createReviewSnapshot(
  cardDetail: TCardDetail,
  params: FSRSParameters,
  now: number | Date = new Date()
) {
  // get current DSR
  let DSR: { D: number; S: number; R: string } | undefined
  if (cardDetail.state === State.Review) {
    const r = fsrs().get_retrievability(cardDetail, now, true)
    DSR = {
      D: cardDetail.difficulty,
      S: cardDetail.stability,
      R: String(r),
    }
  }
  f.parameters = params
  return {
    preview: f.repeat(cardDetail, now),
    DSR,
  }
}
