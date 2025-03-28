'use client'
import { Suspense } from 'react'
import type { DateInput } from 'ts-fsrs'

import { useHydration } from '@/hooks/useHydration'

export default function FormattedDate({ lang, date }: { lang: string; date: DateInput }) {
  const hydrated = useHydration()
  return <Suspense key={hydrated ? 'client' : 'server'}>{hydrated ? dateTimeFormat(lang, date) : new Date(date).toDateString()}</Suspense>
}

function dateTimeFormat(lang: string, date: DateInput): string {
  try {
    return new Intl.DateTimeFormat(lang, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(date))
  } catch {
    return new Intl.DateTimeFormat('en-us', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(date))
  }
}
