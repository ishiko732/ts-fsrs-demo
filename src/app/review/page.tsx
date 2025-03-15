import type { CardServiceType } from '@server/services/decks/cards'
import reviewService from '@server/services/scheduler/review'
import statisticsService from '@server/services/scheduler/statistics'
import { getSessionUserIdThrow } from '@services/auth/session'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { date_scheduler, State } from 'ts-fsrs'

import Finish from '@/components/Finish'
import CardClient from '@/components/schedule/CardsClient'

export const dynamic = 'force-dynamic'

type DataResponse = {
  uid: number
  now: Date
  range: readonly [number, number]
  todayCount: Map<State, number>
  noteBox: Array<Awaited<ReturnType<CardServiceType['getDetail']>>['card']>
}

const getData = cache(async (source?: string): Promise<DataResponse> => {
  const uid = await getSessionUserIdThrow().catch(() => {
    redirect('/api/auth/signin?callbackUrl=/review')
  })
  let now = new Date()
  if (now.getHours() < 4) {
    now = date_scheduler(now, -1, true)
  }
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0)
  const range = [+startOfDay, +now] as const
  const todayCount_promise = statisticsService.getRangeRevlogCount(uid, [+startOfDay, +now], [State.New])
  const cardDetails_promise = reviewService.getReviewCardDetails(uid, +now)
  const [todayCount, cardDetails] = await Promise.all([todayCount_promise, cardDetails_promise])
  return {
    uid,
    now,
    range,
    todayCount,
    noteBox: cardDetails,
  }
})

export default async function Page({ searchParams }: { searchParams: { source?: string } }) {
  const data = await getData(searchParams.source)
  const cardDetailMap = reviewService.distributeCardDetails(data.noteBox)
  let isFinish = true
  for (const value of cardDetailMap.values()) {
    if (value.length > 0) {
      isFinish = false
      break
    }
  }
  return isFinish ? (
    <Finish />
  ) : (
    <div className="flex justify-center flex-col items-center py-8">
      <CardClient noteBox={cardDetailMap} />
    </div>
  )
}
