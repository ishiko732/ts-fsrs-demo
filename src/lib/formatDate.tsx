import { headers } from 'next/headers'
import type { DateInput } from 'ts-fsrs'

import DateItem from '@/components/DateItem'

async function getLang() {
  const headersList = await headers()
  const langHeader = headersList.get('accept-language')
  return langHeader ? langHeader.split(',')[0].toUpperCase() : 'en-us'
}

export default async function FormattedDate({ date }: { date: DateInput }) {
  if (date) {
    const lang = await getLang()
    return <DateItem lang={lang} date={date} />
  } else {
    return null
  }
}
