import { getNotes } from "@/lib/note";
import { Card, Note, State } from "@prisma/client";
import { cache } from "react";
import CardClient from "@/components/CardsClient";
import prisma from "@/lib/prisma";
import { date_scheduler } from "ts-fsrs";
import Finish from "@/components/Finish";

const getData = cache(async (): Promise<Array<Array<Note & { card: Card }>>> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(),4, 0, 0, 0);
  const nextDay = date_scheduler(startOfDay, 1, true);
  const count = await prisma.revlog.count({
    where: {
      review: {
        gte: startOfDay,
        lt: nextDay,
      },
      state: State.New
    },
  }); // get current day new card count
  console.log(count);
  const states = [State.New, State.Learning, State.Relearning, State.Review];
  const noteBox = states.map((state) =>
    getNotes({
      take: state === State.New ? Math.max(0, 50 - count) : undefined,
      query: {
        card: {
          state,
          due: state === State.Review ? { lte: startOfDay } : undefined,
        },
      },
      order:
        state === State.Review ? { card: { last_review: "desc" } } : undefined,
    })
  );

  return Promise.all(noteBox);
});

export default async function Page() {
  const noteBox = await getData();
  const isFinish = noteBox.every((notes) => notes.length === 0);
  return isFinish ? (
    <Finish />
  ) : (
    <div className="flex justify-center flex-col">
      <div>Use client:</div>
      <CardClient noteBox={noteBox} />
    </div>
  );
}
