import { getSessionUserId } from "@/app/(auth)/api/auth/[...nextauth]/session";
import prisma from "./prisma";
import { FSRSParameters, fsrs } from "ts-fsrs";
import { Card, State } from "@prisma/client";

export async function reschedule(
  parameters: FSRSParameters,
  uid?: number | null
) {
  if (!uid) {
    uid = await getSessionUserId();
  }
  if (!uid) return false;

  // get all card
  const cards = await prisma.card.findMany({
    where: {
      note: {
        uid: uid,
      },
      state: State.Review,
    },
    orderBy: {
      last_review: "asc",
    },
  });
  return _reschedule(parameters, cards);
}

export async function _reschedule(parameters: FSRSParameters, cards: Card[]) {
  if (cards.length === 0) {
    return false;
  }
  const f = fsrs(parameters);
  const rescheduled_cards = f.reschedule(cards);
  if (rescheduled_cards.length === 0) {
    return true;
  }
  console.time(`reschedule`);
  await prisma.$transaction(
    rescheduled_cards.map((data) =>
      prisma.card.update({
        where: { cid: data.cid },
        data: data,
      })
    )
  );
  console.timeEnd(`reschedule`);
  console.time(`reschedule: ${rescheduled_cards.length}cards`);
  return true;
}

type Query = {
  uid: number;
  page: number;
  pageSize: number;
  due?: Date;
};

export async function _findCardsByUid({ uid, page, pageSize, due }: Query) {
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
    orderBy: {
      last_review: "asc",
    },
  });
}
