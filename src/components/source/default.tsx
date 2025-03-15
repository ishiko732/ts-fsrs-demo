'use client'

import type { TCardDetail } from '@server/services/decks/cards'

export function Question({ note }: { note: TCardDetail }) {
  return (
    <div className="item-center">
      <div className="w-full">
        <span className="flex justify-center items-center text-2xl">{note.question}</span>
      </div>
    </div>
  )
}

export function Answer({ open, note }: { open: boolean; note: TCardDetail }) {
  return open ? (
    <div className="pt-4 mx-auto max-w-5xl px-4">
      <div>{note?.answer}</div>
    </div>
  ) : null
}
