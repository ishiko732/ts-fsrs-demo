import { type Card, type Revlog, State } from '@prisma/client'
import { getSessionUserId } from '@services/auth/session'
import { type Card as FSRSCard, fsrs, type FSRSHistory, type FSRSParameters, TypeConvert } from 'ts-fsrs'

import prisma from './prisma'

export async function reschedule(parameters: FSRSParameters, uid?: number | null) {
  if (!uid) {
    uid = await getSessionUserId()
  }
  if (!uid) return false

  // get all card and logs
  const cards = await prisma.card.findMany({
    where: {
      note: {
        uid: uid,
      },
      state: State.Review,
    },
    include: {
      logs: true,
    },
    orderBy: {
      last_review: 'asc',
    },
  })

  return _reschedule(parameters, cards)
}

export async function _reschedule(parameters: FSRSParameters, cards: (Card & { logs: Revlog[] })[]) {
  if (cards.length === 0) {
    return false
  }
  const f = fsrs(parameters)

  const rescheduled_cards: (FSRSCard & { cid: number })[] = []
  for (const card of cards) {
    const logs: FSRSHistory[] = card.logs.map((log) => {
      return {
        rating: TypeConvert.rating(log.grade),
        review: log.review,
        due: log.due,
        state: TypeConvert.state(log.state),
      }
    })
    const record = f.reschedule(card, logs)
    if (record.reschedule_item) {
      rescheduled_cards.push(record.reschedule_item.card as FSRSCard & { cid: number })
    }
  }
  if (rescheduled_cards.length === 0) {
    return true
  }
  console.time(`reschedule`)
  await prisma.$transaction(
    rescheduled_cards.map((data) =>
      prisma.card.update({
        where: { cid: data.cid },
        data: {
          stability: data.stability,
          difficulty: data.difficulty,
          due: data.due,
        },
      }),
    ),
  )
  console.timeEnd(`reschedule`)
  console.time(`reschedule: ${rescheduled_cards.length}cards`)
  return true
}

type Query = {
  uid: number
  page: number
  pageSize: number
  due?: Date
}

export async function _findCardsByUid({ uid, page, pageSize, due }: Query): Promise<(Card & { logs: Revlog[] })[]> {
  return prisma.card.findMany({
    where: {
      note: {
        uid,
      },
      state: State.Review,
      due: due
        ? {
            gte: due,
          }
        : undefined,
    },
    take: pageSize,
    skip: pageSize * (page - 1),
    include: {
      logs: true,
    },
    orderBy: {
      last_review: 'asc',
    },
  })
}
