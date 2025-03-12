import type { CardServiceType } from '@services/decks/cards'

import DefaultDisplayMsg from './default'
import HitsuDisplay from './Hitus'
import LingqDisplay from './Lingq'

export default async function Display({ cardIncludeNote }: { cardIncludeNote: Awaited<ReturnType<CardServiceType['getDetail']>>['card'] }) {
  const source = cardIncludeNote.source
  if (!source) {
    return <DefaultDisplayMsg note={cardIncludeNote} />
  }
  switch (source) {
    case 'プログラミング必須英単語600+':
      return <HitsuDisplay note={cardIncludeNote} />
    case 'lingq':
      return <LingqDisplay note={cardIncludeNote} />
    default:
      return <DefaultDisplayMsg note={cardIncludeNote} />
  }
}
