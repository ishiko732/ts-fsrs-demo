import getFormattedDate from "@/lib/format";
import { getNoteByNid } from "@/lib/note";
import { cache } from "react";
import { notFound } from "next/navigation";
import GoBack from "@/app/components/GoBack";
import NoteMsg from "@/app/components/NoteMsg";
import { Card, Note } from "@prisma/client";
import { fsrs } from "ts-fsrs";
import { transferPrismaCardToCard } from "@/vendor/fsrsToPrisma";
import FSRSMsg from "@/app/components/FSRSMsg";
type Props = {
  params: {
    nid: string;
  };
};

export const getData = cache(async (nid: string) => {
  const note = (await getNoteByNid(Number(nid))) as
    | ({ card: Card } & Note)
    | null;
  return note;
});

export default async function Page({ params }: Props) {
  const note = await getData(params.nid);
  if (!note) {
    notFound();
  }

  return (
    <>
      <div className="flex bg-base-200 flex-col justify-center w-screen h-screen items-center ">
        <div className="bg-slate-100 text-black p-4 w-1/2 h-1/2 rounded-lg shadow-md flex">
          <NoteMsg note={note} />
          <div className="w-1/4 flex flex-col">
            <FSRSMsg card={note.card} />
          </div>
        </div>
        <div className="py-4">
          <GoBack />
        </div>
      </div>
    </>
  );
}
