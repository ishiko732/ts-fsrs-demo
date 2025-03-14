import type { CardServiceType } from '@server/services/decks/cards'

import type { changeResponse } from '@/context/CardContext'

import LingqCallHandler from './Lingq'

export default async function handler(note: Awaited<ReturnType<CardServiceType['getDetail']>>['card'], res: changeResponse): Promise<void> {
  const source = note?.source
  if (!source) {
    return
  }
  switch (source) {
    case 'lingq':
      return LingqCallHandler(note, res)
    default:
  }
}
