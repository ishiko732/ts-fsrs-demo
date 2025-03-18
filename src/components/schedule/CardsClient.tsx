import type { TReviewCardDetail } from '@server/services/scheduler/review'
import React from 'react'
import type { State } from 'ts-fsrs'

import { QACard } from '@/components/source'
import { CardProvider } from '@/context/CardContext'

import { Separator } from '../ui/separator'
import DSRDisplay from './DSR'
import RollbackButton from './rollbackButton'
import ShowAnswerButton from './ShowAnswerButton'
import StatusBar from './StatusBar'

export default function CardClient({ noteBox }: { noteBox: Map<State, Array<TReviewCardDetail>> }) {
  return (
    <CardProvider noteBox0={noteBox}>
      <QACard />
      <Separator className="md:w-[80%] mt-2" />
      <StatusBar />
      <ShowAnswerButton />
      <DSRDisplay />
      <RollbackButton />
    </CardProvider>
  )
}
