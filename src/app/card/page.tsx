import { getNotes } from "@/lib/note";
import { Card, Note, State } from "@prisma/client";
import { cache } from "react";
import CardClient from "@/components/CardsClient";
import Finish from "@/components/Finish";
import { getTodayLearnedNewCardCount } from "@/lib/log";

export const dynamic = 'force-dynamic'

const getData = cache(async (): Promise<Array<Array<Note & { card: Card }>>> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(),4, 0, 0, 0);
  const count = await getTodayLearnedNewCardCount(startOfDay)
  const states = [State.New, State.Learning, State.Relearning, State.Review];
  const limit = !isNaN(Number(process.env.NewCardLimit)) ? Number(process.env.NewCardLimit) : 50
  const noteBox = states.map((state) =>
    getNotes({
      take: state === State.New ? Math.max(0, limit- count) : undefined,
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
