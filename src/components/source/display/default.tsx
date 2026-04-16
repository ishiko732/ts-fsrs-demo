import type { TCardDetail } from '@server/services/decks/cards'

export default async function DisplayMsg({ note }: { note: TCardDetail }) {
  return (
    <article className="text-center space-y-6">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight break-words">
        {note.question}
      </h1>
      <p className="text-base md:text-lg text-muted-foreground break-words whitespace-pre-wrap">
        {note.answer}
      </p>
    </article>
  )
}
