'use server'

import { Prisma } from '@prisma/client'
import { getSessionUserId } from '@services/auth/session'
import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import { type CardInput, fixState } from 'ts-fsrs'

import prisma from '@/lib/prisma'
import { forgetAfterHandler } from '@/vendor/fsrsToPrisma/handler'

import { getUserFSRS } from './userParamsService'

type CardSimpleInfo = {
  cid: number
  note: {
    nid: number
    uid: number
  }
}

async function findAuthUserCardSimpleInfo<T extends boolean>(cid: number, includeParams?: T) {
  const uid = await getSessionUserId()
  if (!uid) {
    throw new Error('user not found.')
  }
  const fsrsParamField: Prisma.CardSelect = includeParams
    ? {
        cid: true,
        difficulty: true,
        stability: true,
        due: true,
        last_review: true,
        state: true,
        scheduled_days: true,
        elapsed_days: true,
        reps: true,
        lapses: true,
        note: {
          select: {
            nid: true,
            uid: true,
          },
        },
      }
    : {
        cid: true,
        note: {
          select: {
            nid: true,
            uid: true,
          },
        },
      }

  const cardSimpleInfo = await prisma.card.findUnique({
    where: {
      cid,
    },
    select: fsrsParamField,
  })

  if (!cardSimpleInfo) {
    throw new Error('card not found')
  }
  if (!cardSimpleInfo) {
    notFound()
  }
  if (cardSimpleInfo.note?.uid !== uid) {
    redirect('/denied')
  }
  return cardSimpleInfo as unknown as T extends true ? Promise<CardInput & CardSimpleInfo> : Promise<CardSimpleInfo>
}

export async function forgetAction(cid: number, timestamp: number, reset_count: boolean = false) {
  const cardSimpleInfo = await findAuthUserCardSimpleInfo(cid, true)
  const now = new Date(timestamp)
  const f = await getUserFSRS()
  const recordItem = f.forget(cardSimpleInfo, now, reset_count, forgetAfterHandler)
  const data = await prisma.card.update({
    where: { cid },
    data: recordItem,
    include: {
      logs: true,
    },
  })
  if (data) {
    revalidatePath(`/note/${data.nid}`)
  }
  return {
    nextState: fixState(recordItem.state),
    nextDue: recordItem.due,
    nid: cardSimpleInfo.note.nid as number,
  }
}
