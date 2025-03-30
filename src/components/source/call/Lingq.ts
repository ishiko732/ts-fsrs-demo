import client from '@server/libs/rpc'
import type { TCardDetail } from '@server/services/decks/cards'
import { changeLingqStatus, handlerProxy } from '@server/services/extras/lingq/request'
import type { ReviewServiceType } from '@server/services/scheduler/review'
import { toast } from 'sonner'
import { date_diff, fixDate, State } from 'ts-fsrs'

export default async function LingqCallHandler(note: TCardDetail, res: Awaited<ReturnType<ReviewServiceType['next']>>) {
  const sourceId = Number(note.sourceId)
  const nid = Number(note.id)
  const language = (note.extend as Record<string, string>)['lang']

  if (!sourceId || !language || !window) {
    return
  }

  const { next_state, next_due } = res
  let status = 0
  let extended_status = 0
  if (next_state != State.Review) {
    status = 0 // LingqStatus.New;
    extended_status = 0 //LingqExtendedStatus.Learning;
  } else if (next_due) {
    const now = new Date()
    const diff = date_diff(fixDate(next_due), now, 'days')
    //Ref https://github.com/thags/lingqAnkiSync/issues/34
    if (diff > 15) {
      status = 3 // LingqStatus.Learned;
      extended_status = 3 // LingqExtendedStatus.Known;
    } else if (diff > 7 && diff <= 15) {
      status = 3 // LingqStatus.Learned;
      extended_status = 0 //LingqExtendedStatus.Learning;
    } else if (diff > 3 && diff <= 7) {
      status = 2 // LingqStatus.Familiar;
      extended_status = 0 // LingqExtendedStatus.Learning;
    } else {
      status = 1 // LingqStatus.Recognized;
      extended_status = 0 // LingqExtendedStatus.Learning;
    }
  }

  const token = await getLingqToken()
  if (token) {
    const formData = new FormData()
    formData.append('status', status.toString())
    formData.append('extended_status', extended_status.toString())
    handlerProxy()
    toast.promise(
      changeLingqStatus({
        language: language as languageCode,
        id: sourceId,
        token,
        status,
        extended_status,
      }),
      {
        success: (lingq) => {
          if (nid && !isNaN(Number(nid))) {
            const question = lingq.term.replace(/\s+/g, '')
            const answer = lingq.hints?.[0].text ?? ''
            client.notes[':nid'].$put({
              param: { nid: `${nid}` },
              json: {
                did: note.did,
                question: question,
                source: note.source,
                answer: answer,
                sourceId: String(lingq.pk),
                extend: {
                  pk: lingq.pk,
                  term: question,
                  fragment: lingq.fragment,
                  notes: lingq.notes,
                  words: lingq.words,
                  hints: lingq.hints,
                  tags: lingq.tags,
                  transliteration: lingq.transliteration,
                  lang: language,
                },
              },
            })
          }
          return 'Sync to LingQ successfully'
        },
        error: (err) => {
          return `Sync to LingQ failed: ${err}`
        },
      },
    )
  }
}

export async function getLingqToken() {
  const globalForLingqToken = window as unknown as { lingqToken?: string }
  const token = globalForLingqToken.lingqToken
  if (!token) {
    const request = await client.extras.lingq.session.$get({
      query: {
        /** TODO did */
      },
    })
    if (request.ok) {
      const data = await request.json()
      globalForLingqToken.lingqToken = data.lingqKey
    } else {
      globalForLingqToken.lingqToken = ''
    }
    return globalForLingqToken.lingqToken
  }
  return token
}
