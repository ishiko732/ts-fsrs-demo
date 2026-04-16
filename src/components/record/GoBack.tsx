import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '../ui/button'

export default function GoBack() {
  return (
    <Button asChild variant="ghost" size="sm">
      <Link href="/note" prefetch={true}>
        <ArrowLeft aria-hidden="true" />
        Back to notes
      </Link>
    </Button>
  )
}
