import { getNoteByNid } from "@/lib/note";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import GoBack from "@/components/record/GoBack";
import FSRSMsg from "@/components/record/FSRSMsg";
import { findLogsByCid } from "@/lib/log";
import LogTable from "@/components/record/LogTable";
import { isSelf } from "@/auth/api/auth/[...nextauth]/session";
import { SourceNote } from "@/components/source";
import DisplayMsg from "@/components/source/display";
type Props = {
  params: {
    nid: string;
  };
  searchParams: {
    deleted: '1' | '0';
  }
};

const getData = cache(async (nid: string, deleted: boolean) => {
  const note = (await getNoteByNid(Number(nid), deleted)) as
    | SourceNote
    | null;
  return note;
});

export default async function Page({ params, searchParams }: Props) {
  const deleted = searchParams["deleted"] === '1';
  const note = await getData(params.nid, deleted);
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
          <DisplayMsg note={note} />
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
