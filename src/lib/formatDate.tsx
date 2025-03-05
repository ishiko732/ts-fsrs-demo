import { headers } from 'next/headers'
import { DateInput } from 'ts-fsrs'

import DateItem from '@/components/DateItem'

function getLang() {
  const langHeader = headers()?.get('accept-language')
  return langHeader ? langHeader.split(',')[0].toUpperCase() : 'en-us'
}

export default function FormattedDate({ date }: { date: DateInput }): React.ReactNode {
  if (date) {
    const lang = getLang()
    return <DateItem lang={lang} date={date} />
  } else {
    return null
  }
}
