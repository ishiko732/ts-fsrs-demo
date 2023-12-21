import { getNotes } from "@/lib/note";
import { Card, Note, State } from "@prisma/client";
import { cache } from "react";
import CardClient from "@/components/schedule/CardsClient";
import Finish from "@/components/Finish";
import { getTodayLearnedNewCardCount } from "@/lib/log";
import { getAuthSession } from "@/auth/api/auth/[...nextauth]/session";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic'

const getData = cache(async (): Promise<Array<Array<Note & { card: Card }>>> => {
  const session = await getAuthSession();
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/card')
  }
  const uid = Number(session.user!!.id)
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0);
  const {todayCount, limit} = await getTodayLearnedNewCardCount(uid, startOfDay)
  const states = [State.New, State.Learning, State.Relearning, State.Review];
  const noteBox = states.map((state) =>
    getNotes({
      uid: uid,
      take: state === State.New ? Math.max(0, limit - todayCount) : undefined,
      query: {
        card: {
          state,
          due: state === State.Review ? { lte: startOfDay } : undefined,
        },
      }
    })
  );
  
  return Promise.all(noteBox);
});

export default async function Page() {
  const noteBox = (await getData()).map((noteBox) => noteBox.sort(() => Math.random() - Math.random()))
  const isFinish = noteBox.every((notes) => notes.length === 0);
  return isFinish ? (
    <Finish />
  ) : (
    <div className="flex justify-center flex-col py-8">
      <CardClient noteBox={noteBox} />
    </div>
  );
}
