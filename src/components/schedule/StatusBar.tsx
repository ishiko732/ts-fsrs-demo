'use client'
import { State } from 'ts-fsrs'

import { useCardContext } from '@/context/CardContext'
import { cn } from '@/lib/utils'

const STATES = [
  { type: State.New, label: 'New', dot: 'bg-sky-500' },
  { type: State.Learning, label: 'Learning', dot: 'bg-amber-500' },
  { type: State.Review, label: 'Review', dot: 'bg-emerald-500' },
] as const

export default function StatusBar() {
  const { noteBox, currentType } = useCardContext()

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STATES.map(({ type, label, dot }) => {
        const active = currentType === type
        return (
          <div
            key={type}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              active
                ? 'border-foreground/15 bg-foreground/5 text-foreground'
                : 'border-transparent bg-muted text-muted-foreground'
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
            <span>{label}</span>
            <span
              className={cn(
                'tabular-nums',
                active ? 'font-semibold text-foreground' : 'text-foreground/60'
              )}
            >
              {noteBox[type].length}
            </span>
          </div>
        )
      })}
    </div>
  )
}
