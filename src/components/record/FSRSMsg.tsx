import type { TCardDetail } from '@server/services/decks/cards'
import { fsrs, S_MIN, State } from 'ts-fsrs'

import DateItem from '@/lib/formatDate'

import Forget from './Forget'
import Suspended from './Suspended'

type Props = {
  card: TCardDetail
}

const STATE_LABEL: Record<number, string> = {
  [State.New]: 'New',
  [State.Learning]: 'Learning',
  [State.Review]: 'Review',
  [State.Relearning]: 'Relearning',
}

function Metric({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6">
      <div className="text-3xl md:text-4xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  )
}

function Meta({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground/80">
        {label}
      </span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

async function FSRSMsgImpl({ card }: Props) {
  const f = fsrs()
  // fix: s=0 https://github.com/ishiko732/ts-fsrs-demo/issues/52
  card.stability = Math.max(S_MIN, card.stability)

  const retrievability = f.get_retrievability(card)
  const stateLabel = STATE_LABEL[card.state] ?? String(card.state)
  const showFsrsTriad = card.state !== State.New
  const showLearningSteps =
    card.state === State.Learning || card.state === State.Relearning

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {showFsrsTriad ? (
        <div className="flex items-stretch justify-center">
          <Metric label="Difficulty" value={card.difficulty.toFixed(2)} />
          <div className="w-px bg-border" aria-hidden="true" />
          <Metric
            label="Stability"
            value={`${card.stability.toFixed(2)}d`}
          />
          <div className="w-px bg-border" aria-hidden="true" />
          <Metric label="Retrievability" value={retrievability ?? '—'} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Meta label="State" value={stateLabel} />
        {showLearningSteps ? (
          <Meta label="Step" value={card.learning_steps + 1} />
        ) : null}
        <Meta label="Reps" value={card.reps} />
        <Meta label="Lapses" value={card.lapses} />
        <Meta label="Elapsed" value={`${card.elapsed_days}d`} />
        <Meta label="Scheduled" value={`${card.scheduled_days}d`} />
        <Meta label="Next" value={<DateItem date={card.due} />} />
        {card.last_review ? (
          <Meta
            label="Last"
            value={<DateItem date={card.last_review} />}
          />
        ) : null}
        {card.suspended ? (
          <span className="font-medium text-destructive">Suspended</span>
        ) : null}
      </div>
    </div>
  )
}

function FSRSMsgActions({ card }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Forget cid={card.id} />
      <Suspended cid={card.id} suspend={card.suspended} />
    </div>
  )
}

const FSRSMsg = Object.assign(FSRSMsgImpl, { Actions: FSRSMsgActions })
export default FSRSMsg
