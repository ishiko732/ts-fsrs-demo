import { deleteHints, getHints } from '@server/services/extras/lingq/request'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { hintsId: string } }) {
  const token = request.headers.get('Authorization')
  if (!token) {
    return NextResponse.json({ error: 'token not found' }, { status: 401 })
  }
  const data = await getHints({
    hintsId: Number(params.hintsId),
    token,
  })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: { hintsId: string } }) {
  const token = request.headers.get('authorization')
  if (!token) {
    return NextResponse.json({ error: 'token not found' }, { status: 401 })
  }
  const data = await deleteHints({
    hintsId: Number(params.hintsId),
    token,
  })
  return NextResponse.json(data)
}
