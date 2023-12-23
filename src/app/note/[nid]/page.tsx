import { getNoteByNid, getNotes } from "@/lib/note";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import GoBack from "@/components/record/GoBack";
import NoteMsg from "@/components/card/NoteMsg";
import { Card, Note } from "@prisma/client";
import FSRSMsg from "@/components/record/FSRSMsg";
import { findLogsByCid } from "@/lib/log";
import LogTable from "@/components/record/LogTable";
import { isSelf } from "@/auth/api/auth/[...nextauth]/session";
type Props = {
  params: {
    nid: string;
  };
};

const getData = cache(async (nid: string) => {
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
  const own = await isSelf(note.uid);
  if (!own) {
    redirect("/denied");
  }
  const logs = await findLogsByCid(note.card.cid);
  return (
    <div className="">
      <div className="flex flex-col justify-center w-full h-screen items-center overflow-y-auto py-4">
        <div className="overflow-y-auto p-4 sm:w-1/2 max-h-1/2 rounded-lg shadow-md sm:flex">
          <NoteMsg note={note} />
          <div className="py-4 sm:py-0 divider divider-horizontal"></div>
          <div className="w-full sm:w-1/4 sm:flex sm:flex-col">
            <FSRSMsg card={note.card} />
          </div>
        </div>
        {logs && logs.length > 0 && <LogTable logs={logs} />}
        <div className="py-4">
          <GoBack />
        </div>
      </div>
    </div>
  );
}
