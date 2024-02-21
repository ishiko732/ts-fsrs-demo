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
import TabConfig from "@/components/record/TabConfig";
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

  const tabs = [];
  tabs.push({ tabName: "Note", component: <DisplayMsg note={note} /> })
  if (logs && logs.length > 0) {
    tabs.push({ tabName: "Logs", component: <LogTable logs={logs} /> })
  }
  tabs.push({ tabName: "FSRS", component: <FSRSMsg card={note.card} /> })


  return (
    <>
      <TabConfig tabNodes={tabs} defaultIndex={0} />
      <div className="flex justify-center py-4">
        <GoBack />
      </div>
    </>
  );
}
