import deckService from '@server/services/decks'
import lingqService from '@server/services/extras/lingq'
import { getAuthSession } from '@services/auth/session'
import { NextResponse } from 'next/server'

export async function GET() {
  function buf2hex(buffer: ArrayBuffer) {
    // buffer is an ArrayBuffer
    return Array.from(new Uint8Array(buffer))
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  }
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-CTR',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )
  const exported = await crypto.subtle.exportKey('raw', key)
  return NextResponse.json({ key: buf2hex(exported) })
}

export async function POST() {
  const session = await getAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'permission denied' }, { status: 403 })
  }
  const uid = Number(session.user.id)
  const deckId = await deckService.getDefaultDeck(uid)
  const params = await lingqService.getLingqInfoByDeckId(uid, deckId)

  return NextResponse.json({ lingqKey: params?.token ?? '' })
}
