import type { TReviewCardDetail } from '@server/services/scheduler/review'
import type { State } from 'ts-fsrs'

import { QACard } from '@/components/source'
import { CardProvider } from '@/context/CardContext'

import DSRDisplay from './DSR'
import RollbackButton from './rollbackButton'
import ShowAnswerButton from './ShowAnswerButton'
import StatusBar from './StatusBar'

export default function CardClient({
  noteBox,
}: {
  noteBox: Map<State, Array<TReviewCardDetail>>
}) {
  return (
    <CardProvider noteBox0={noteBox}>
      <section className="rounded-2xl border border-border/70 bg-card text-card-foreground shadow-xs">
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
          <StatusBar />
          <RollbackButton />
        </header>
        <div className="px-6 py-10 md:px-10 md:py-14">
          <QACard />
        </div>
      </section>

      <div className="mt-6">
        <ShowAnswerButton />
      </div>

      <div className="mt-6 flex justify-center">
        <DSRDisplay />
      </div>
    </CardProvider>
  )
}
