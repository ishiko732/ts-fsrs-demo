import noteService from '@server/services/decks/notes'
import { changeLingqHints, changeLingqStatus, getLingq } from '@server/services/extras/lingq/request'
import { getSessionUserIdThrow } from '@services/auth/session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { language: string; id: string } }) {
  const token = request.headers.get('Authorization')
  if (!token) {
    return NextResponse.json({ error: 'token not found' }, { status: 401 })
  }
  const data = await getLingq({
    language: params.language as languageCode,
    id: Number(params.id),
    token,
  })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: { language: string; id: string } }) {
  const token = request.headers.get('authorization')
  const formData = await request.formData()
  const status = Number(formData.get('status')) as LingqStatus
  const extended_status = Number(formData.get('extended_status')) as LingqExtendedStatus
  const hints = formData.get('hints')
  if (!token) {
    return NextResponse.json({ error: 'token not found' }, { status: 401 })
  }
  if (process.env.NODE_ENV !== 'production') {
    console.debug('not production env')
    return NextResponse.json({ error: 'must production env' }, { status: 400 })
  }
  let lingq
  if (hints) {
    lingq = await changeLingqHints({
      language: params.language as languageCode,
      cardId: Number(params.id),
      token,
      hints: JSON.parse(hints as string),
    })
  } else {
    lingq = await changeLingqStatus({
      language: params.language as languageCode,
      id: Number(params.id),
      token,
      status,
      extended_status,
    })
    const nid = request.headers.get('noteId')
    if (nid && !isNaN(Number(nid))) {
      const userId = await getSessionUserIdThrow()
      const question = lingq.term.replace(/\s+/g, '')
      const answer = lingq.hints?.[0].text ?? undefined
      await noteService.modifyNote(userId, Number(nid), {
        answer: answer,
        extend: JSON.stringify({
          pk: lingq.pk,
          term: question,
          fragment: lingq.fragment,
          notes: lingq.notes,
          words: lingq.words,
          hints: lingq.hints,
          tags: lingq.tags,
          transliteration: lingq.transliteration,
          lang: params.language,
        }),
      })
    }
  }
  return NextResponse.json(lingq)
}
