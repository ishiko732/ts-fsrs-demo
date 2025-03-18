import { getLingqTTS } from '@server/services/extras/lingq/request'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const language = url.searchParams.get('language') as languageCode
  const text = url.searchParams.get('text')
  const token = request.headers.get('Authorization')
  if (!token) {
    return NextResponse.json({ error: 'token not found' }, { status: 401 })
  }
  if (!text || !language) {
    return NextResponse.json({ error: 'text/language not found' }, { status: 400 })
  }

  const data = await getLingqTTS({
    language,
    text,
    token,
  })
  return NextResponse.json(data)
}
