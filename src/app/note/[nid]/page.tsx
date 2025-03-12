import { getSessionUserIdThrow } from '@server/services/auth/session'
import { notFound, redirect } from 'next/navigation'
import { cache } from 'react'

import { getUserNote } from '@/actions/userNoteService'
import FSRSDetail from '@/components/record/FSRSMsg'
import GoNotes from '@/components/record/GoBack'
import LogTable from '@/components/record/LogTable'
import type { SourceNote } from '@/components/source'
import DisplayMsg from '@/components/source/display'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { findLogsByCid } from '@/lib/log'
import { getNoteByNid } from '@/lib/note'
type Props = {
  params: {
    nid: string
  }
  searchParams: {
    deleted: '1' | '0'
    cid?: string
  }
}

const buildQuery = async ({ params, searchParams }: Props) => {
  const deleted = searchParams.deleted === '1'
  const nid = Number(params.nid)
  const cid = Number(searchParams?.cid ?? 0)
  const uid = await getSessionUserIdThrow().catch(() => {
    redirect(`/api/auth/signin?callbackUrl=/note/${nid}`)
  })
  return {
    uid,
    nid,
    cid,
    deleted,
  }
}

export default async function Page({ params, searchParams }: Props) {
  const { deleted, uid, cid, nid } = await buildQuery({ params, searchParams })
  const note = await getUserNote(nid, deleted).catch(() => {
    notFound()
  })
  const logs = await findLogsByCid(note.card.cid)

  return (
    <>
      <div className="container pt-4 h-[calc(100vh_-_88px)]">
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
          <ResizablePanel defaultSize={60} id="controlledPanel1">
            <div className="flex h-full  items-center justify-center p-6">
              <DisplayMsg note={note} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="resize size" aria-controls="controlledPanel" aria-valuemax={100} aria-valuemin={0} />
          <ResizablePanel defaultSize={40}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50} id="controlledPanel2">
                <div className="flex h-full items-start  justify-center px-6 overflow-auto">
                  <LogTable logs={logs} />
                </div>
              </ResizablePanel>
              <ResizableHandle
                withHandle
                aria-label="resize log and card"
                aria-controls="controlledPanel2"
                aria-valuemax={100}
                aria-valuemin={0}
              />
              <ResizablePanel defaultSize={40} id="controlledPanel3">
                <div className="justify-center items-center mt-4 hidden md:flex">
                  <span className="font-semibold">Card[FSRS]</span>
                </div>
                <div className="flex h-full items-center justify-center p-6">
                  <FSRSDetail card={note.card} />
                </div>
              </ResizablePanel>
              <ResizableHandle
                withHandle
                aria-label="resize card and action"
                aria-controls="controlledPanel3"
                aria-valuemax={100}
                aria-valuemin={0}
              />
              <ResizablePanel defaultSize={10}>
                <div className="flex h-full items-center justify-center p-6">
                  <GoNotes />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}
