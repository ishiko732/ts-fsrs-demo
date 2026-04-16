'use client'
import type { TCardDetail } from '@server/services/decks/cards'
import {
  getLingqTTS,
  handlerProxy,
} from '@server/services/extras/lingq/request'
import { useEffect, useRef, useState } from 'react'

import Audio from '@/components/card/Audio'

import { getLingqToken } from './call/Lingq'
import { HighlightedWord, MergeTransliteration } from './display/Lingq'

export function Question({ open, note }: { open: boolean; note: TCardDetail }) {
  const extend = note.extend as Partial<Lingq> & {
    lang: string
  }
  const lang = extend.lang
  const fragment = extend.fragment!
  const transliteration = extend.transliteration
  const tags = extend.tags
  const words = extend.words
  const [audio, setAudio] = useState<string>()
  const audioRef = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    setAudio(undefined)
    if ((note && lang === 'ja') || lang === 'en') {
      ;(async () => {
        const token = await getLingqToken()
        console.log(token)
        if (!token) {
          return
        }
        handlerProxy()
        const tts = await getLingqTTS({
          language: lang as languageCode,
          text: note.question,
          token,
        })
        if (tts) {
          setAudio(tts.audio)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, lang])

  return (
    <div className="text-center">
      <h2 className="break-words text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {note.question}
      </h2>
      <div className="mt-4 flex flex-col items-center gap-3 text-muted-foreground">
        {open && transliteration && (
          <div className="text-sm">
            <MergeTransliteration {...transliteration} />
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {open && words && words.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {words.map((word) => (
              <span
                key={word}
                className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-foreground/70"
              >
                {word}
              </span>
            ))}
          </div>
        )}
        <div className="text-sm leading-relaxed">
          <HighlightedWord text={fragment} word={note.question} />
        </div>
        {audio && (
          <Audio
            url={audio}
            ref={audioRef}
            onCanPlay={() => {
              audioRef.current?.play()
            }}
          />
        )}
      </div>
    </div>
  )
}

export function Answer({ open, note }: { open: boolean; note: TCardDetail }) {
  const extend = note.extend as Partial<Lingq>
  const hints = extend.hints
  if (!open || !hints?.length) return null
  return (
    <div className="mt-8 border-t border-border/60 pt-8">
      <ul className="mx-auto max-w-2xl space-y-2">
        {hints.map((hint) => (
          <li
            key={hint.id}
            className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground"
          >
            <span className="mt-0.5 inline-flex items-center rounded-full border border-border/70 bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {hint.locale}
            </span>
            <span className="flex-1 break-words text-foreground/80">
              {hint.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
