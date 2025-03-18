import { getSessionUserIdThrow } from '@server/services/auth/session'
import reviewService from '@server/services/scheduler/review'
import { revalidatePath } from 'next/cache'

import { cn } from '@/lib/utils'

import SuspendedSubmit from '../LoadingSubmitButton'

type Props = {
  cid: number
  suspend: boolean
  className?: string
}

export default function Suspended({ cid, suspend, className }: Props) {
  const suspendAction = async function (cid: number, suspend: boolean) {
    'use server'
    const uid = await getSessionUserIdThrow()
    const data = await reviewService.switch_suspend(uid, cid, Date.now(), suspend)

    revalidatePath(`/note/${data.nid}`)
  }.bind(null, cid, !suspend)

  return (
    <form action={suspendAction} className="flex justify-center">
      <SuspendedSubmit className={cn(className)}>Toggle Suspended</SuspendedSubmit>
    </form>
  )
}
