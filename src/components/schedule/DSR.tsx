'use client'
import { State } from 'ts-fsrs'

import { useCardContext } from '@/context/CardContext'

export default function DSRDisplay() {
  const { DSR, open, currentType } = useCardContext()
  if (!DSR || open || currentType !== State.Review) return null

  const items: Array<[string, string]> = [
    ['D', DSR.D.toFixed(2)],
    ['S', String(DSR.S)],
    ['R', DSR.R],
  ]

  return (
    <dl
      aria-label="Card memory state"
      className="flex items-center gap-3 text-xs tabular-nums text-muted-foreground"
    >
      {items.map(([key, value], i) => (
        <span key={key} className="flex items-center gap-3">
          {i > 0 && (
            <span aria-hidden className="text-border">
              ·
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <dt className="font-medium uppercase tracking-wide text-muted-foreground/80">
              {key}
            </dt>
            <dd className="font-semibold text-foreground/80">{value}</dd>
          </span>
        </span>
      ))}
    </dl>
  )
}
