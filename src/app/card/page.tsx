import { getNotes } from "@/lib/note";
import { Card, Control, Note, State } from "@prisma/client";
import React from "react";
import CardClient from "../components/CardsClient";
import prisma from "@/lib/prisma";
import { date_scheduler } from "ts-fsrs";

export const getData = async (
  due: Date
): Promise<Array<Array<Note & { card: Card }>>> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextDay = date_scheduler(startOfDay, 1, true);
  const count = await prisma.card.count({
    where: {
      last_review: {
        gte: startOfDay,
        lt: nextDay,
      },
    },
  });
  console.log(count);
  const states = [State.New, State.Learning, State.Relearning, State.Review];
  const noteBox = states.map((state) =>
    getNotes({
      take: state === State.New ? Math.max(0, 100 - count) : undefined,
      query: {
        card: {
          state,
          due: state === State.Review ? { lte: due } : undefined,
        },
      },
      order:
        state === State.Review ? { card: { last_review: "desc" } } : undefined,
    })
  );

  return Promise.all(noteBox);
};

export default async function Page() {
  const noteBox = await getData(new Date());
  return (
    <div className="flex justify-center flex-col">
      <div>Use client:</div>
      <CardClient noteBox={noteBox} />
    </div>
  );
}
