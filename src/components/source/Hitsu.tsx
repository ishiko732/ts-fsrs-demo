'use client'
import type { TCardDetail } from '@server/services/decks/cards'

import Audio from '@/components/card/Audio'
import Video from '@/components/card/Video'

export function HitsuAnswer({
  open,
  note,
}: {
  open: boolean
  note: TCardDetail
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extend = note ? (note.extend as any) : {}
  const 分類 = extend.分類 as string | undefined
  const 品詞 = extend.品詞 as string | undefined
  const 例文 = extend.例文 as string | undefined
  const 例文訳 = extend.例文訳 as string | undefined
  const 解説 = extend.解説 as string | undefined
  const 発音 = extend.発音 as string | undefined
  const ビデオ = extend.ビデオ as string | undefined

  if (!open) return null

  return (
    <div className="mt-8 border-t border-border/60 pt-8">
      {(分類 || 品詞) && (
        <div className="mb-4 flex justify-center gap-1.5">
          {分類 && (
            <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {分類}
            </span>
          )}
          {品詞 && (
            <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {品詞}
            </span>
          )}
        </div>
      )}
      <dl className="mx-auto max-w-2xl space-y-3 text-base leading-relaxed text-foreground/80">
        <Row label="意味" value={note?.answer} emphasize />
        {例文 && <Row label="例文" value={例文} />}
        {例文訳 && <Row label="例文訳" value={例文訳} />}
        {解説 && <Row label="解説" value={解説} />}
      </dl>
      {(発音 || ビデオ) && (
        <div className="mt-6 flex flex-col items-center gap-3">
          {発音 && <Audio url={発音} />}
          {ビデオ && <Video url={ビデオ} />}
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value?: string | null
  emphasize?: boolean
}) {
  return (
    <div className="grid grid-cols-[4rem_1fr] items-baseline gap-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          emphasize
            ? 'whitespace-pre-wrap break-words text-foreground'
            : 'whitespace-pre-wrap break-words text-muted-foreground'
        }
      >
        {value}
      </dd>
    </div>
  )
}
