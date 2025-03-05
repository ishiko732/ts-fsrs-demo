import { NextRequest, NextResponse } from 'next/server'

import { getAuthSession } from '@/auth/api/auth/[...nextauth]/session'
import { addNote } from '@/lib/note'
import { NodeData } from '@/types'

export async function POST(request: NextRequest) {
  const json: Partial<NodeData> = await request.json()
  if (!json.answer || !json.answer) {
    return NextResponse.json('question/answer invaild data', { status: 400 })
  }
  const session = await getAuthSession()
  if (!session) {
    return NextResponse.json({ count: 0 }, { status: 403 })
  }
  await addNote({
    ...json,
    uid: Number(session.user!.id),
  })
  return NextResponse.json({ count: 1 }, { status: 200 })
}
