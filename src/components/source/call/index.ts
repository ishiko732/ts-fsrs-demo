import type { ReviewServiceType, TReviewCardDetail } from '@server/services/scheduler/review'

import LingqCallHandler from './Lingq'

export default async function handler(note: TReviewCardDetail, res: Awaited<ReturnType<ReviewServiceType['next']>>): Promise<void> {
  const source = note?.source
  if (!source) {
    return
  }
  switch (source) {
    case 'lingq':
      return LingqCallHandler(note, res)
    default:
  }
}
