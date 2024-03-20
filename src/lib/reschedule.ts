import { getSessionUserId } from "@/app/(auth)/api/auth/[...nextauth]/session";
import prisma from "./prisma";
import { FSRSParameters, fsrs } from "ts-fsrs";
import { State } from "@prisma/client";

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
  });

  const f = fsrs(parameters);
  const rescheduled_cards = f.reschedule(cards);
  if (rescheduled_cards.length === 0) {
    return true;
  }
  await prisma.$transaction(
    rescheduled_cards.map((data) =>
      prisma.card.update({
        where: { cid: data.cid },
        data: data,
      })
    )
  );
  console.log(`reschedule: ${rescheduled_cards.length}cards`);
  return true;
}
