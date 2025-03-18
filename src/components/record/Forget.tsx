import { getSessionUserIdThrow } from '@server/services/auth/session'
import reviewService from '@server/services/scheduler/review'
import { revalidatePath } from 'next/cache'
import React from 'react'

import { cn } from '@/lib/utils'

import ForgetSubmit from '../LoadingSubmitButton'

type Props = {
  cid: number
  className?: string
}

export default function Forget({ cid, className }: Props) {
  const forgetAction = async function (cid: number, timestamp: number, reset_count: boolean) {
    'use server'
    const uid = await getSessionUserIdThrow()
    const data = await reviewService.forget(uid, cid, timestamp, 0, reset_count)

    revalidatePath(`/note/${data.nid}`)
  }.bind(null, cid, new Date().getTime(), true)

  return (
    <form action={forgetAction} className="flex justify-center">
      <ForgetSubmit className={cn('btn btn-outline', className)}>Forget</ForgetSubmit>
    </form>
  )
}
