import Link from 'next/link'

import { Button } from '../ui/button'

export default function GoBack() {
  return (
    <Button asChild variant={'outline'}>
      <Link href={'/note'}>Go Notes</Link>
    </Button>
  )
}
