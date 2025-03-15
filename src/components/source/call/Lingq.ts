import type { TCardDetail } from '@server/services/decks/cards'
import type { ReviewServiceType } from '@server/services/scheduler/review'
import { date_diff, fixDate, State } from 'ts-fsrs'

export default async function LingqCallHandler(note: TCardDetail, res: Awaited<ReturnType<ReviewServiceType['next']>>) {
  const sourceId = Number(note.sourceId)
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
    await fetch(`/api/lingq/v3/${language}/cards/${sourceId}`, {
      method: 'PATCH',
      headers: {
        Authorization: token,
        noteId: note.nid.toString(),
      },
      body: formData,
    })
  }
}

export async function getLingqToken() {
  const globalForLingqToken = window as unknown as { lingqToken?: string }
  const token = globalForLingqToken.lingqToken
  if (!token) {
    const key = await fetch('/api/lingq/key', {
      method: 'POST',
    }).then((res) => res.json())
    if (key.lingqKey) {
      globalForLingqToken.lingqToken = key.lingqKey
    }
    return globalForLingqToken.lingqToken
  }
  return token
}
