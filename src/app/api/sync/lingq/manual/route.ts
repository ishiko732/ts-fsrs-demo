import lingqService from '@server/services/extras/lingq'
import { getLingqs } from '@server/services/extras/lingq/request'
import { getAuthSession } from '@services/auth/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No user' }, { status: 401 })
  }
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const did = Number(searchParams.get('did') ?? 0)
  const uid = Number(session.user.id)
  const lingqInfo = await lingqService.getLingqInfoByDeckId(uid, did)
  if (!lingqInfo.token) {
    return NextResponse.json({ error: 'No lingq token' }, { status: 400 })
  }

  const lang = searchParams.get('lang')
  const page = searchParams.get('page') ?? '1'
  const page_size = searchParams.get('pageSize') ?? '25'

  if (!lang) {
    return NextResponse.json({ error: 'No lang' }, { status: 400 })
  }
  if (!page) {
    return NextResponse.json({ error: 'No page' }, { status: 400 })
  }
  const data = await getLingqs({
    language: lang as languageCode,
    token: lingqInfo.token,
    page: Number(page),
    page_size: Number(page_size),
    search_criteria: 'startsWith',
    sort: 'date',
    status: ['0', '1', '2', '3'],
  })
  await lingqService.sync(uid, did, lang, data.results)
  return NextResponse.json(
    {
      total: data.count,
      page: Number(page),
      page_size: Number(page_size),
      pre: data.previous,
      next: data.next,
    },
    { status: 200 },
  )
}
