import { getSessionUserIdThrow } from '@server/services/auth/session'
import cardService from '@server/services/decks/cards'
import { notFound, redirect } from 'next/navigation'

import FSRSDetail from '@/components/record/FSRSMsg'
import GoNotes from '@/components/record/GoBack'
import LogTable from '@/components/record/LogTable'
import DisplayMsg from '@/components/source/display'

type Params = {
  deleted: '1' | '0'
  cid?: string
}

type Props = {
  params: Promise<{
    nid: string
  }>
  searchParams: Promise<Params>
}

const buildQuery = async (props: Props) => {
  const searchParams = await props.searchParams
  const params = await props.params
  const deleted = searchParams.deleted === '1'
  const nid = Number(params.nid)
  const cid = Number(searchParams?.cid ?? 0)
  const uid = await getSessionUserIdThrow().catch(() => {
    const searchPath = new URLSearchParams()
    if (cid) searchPath.set('cid', String(cid))
    redirect(
      `/api/auth/signin?callbackUrl=/note/${nid}?${searchPath.toString()}`
    )
  })
  return {
    uid,
    nid,
    cid,
    deleted,
  }
}

export default async function Page(props: Props) {
  const { deleted, uid, cid, nid } = await buildQuery(props)
  const { card, logs } = await cardService
    .getDetail(uid, nid, cid, deleted)
    .catch(() => {
      notFound()
    })
  return (
    <div className="container py-8 space-y-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <GoNotes />
        <FSRSDetail.Actions card={card} />
      </div>

      <section className="mx-auto max-w-2xl py-8">
        <DisplayMsg cardIncludeNote={card} />
      </section>

      <section>
        <FSRSDetail card={card} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Review history
        </h2>
        <div className="rounded-lg border overflow-x-auto">
          <LogTable logs={logs} />
        </div>
      </section>
    </div>
  )
}
