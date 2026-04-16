'use client'

import type { TCardDetail } from '@server/services/decks/cards'

export function Question({ note }: { note: TCardDetail }) {
  return (
    <div className="text-center">
      <h2 className="break-words text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {note.question}
      </h2>
    </div>
  )
}

export function Answer({ open, note }: { open: boolean; note: TCardDetail }) {
  if (!open) return null
  return (
    <div className="mt-8 border-t border-border/60 pt-8">
      <p className="mx-auto max-w-2xl whitespace-pre-wrap break-words text-center text-base leading-relaxed text-muted-foreground md:text-lg">
        {note?.answer}
      </p>
    </div>
  )
}
