import extraModel from '@server/models/extras'
import type { NoteTable } from '@server/models/notes'
import noteService from '@server/services/decks/notes'
import type { Insertable } from 'kysely'

import { getLingqContext, getLingqs } from './request'

class LingqService {
  async getLingqInfoByDeckId(uid: number, did: number) {
    const extra = await extraModel.db
      .selectFrom(extraModel.table)
      .selectAll()
      .where('uid', '=', uid)
      .where('did', '=', did)
      .where('name', '=', 'lingq')
      .executeTakeFirstOrThrow()
    const extraData = extra.extra
    return {
      token: extraData.token as string | undefined,
      lang: extraData.lang as string | undefined,
    }
  }

  async sync(uid: number, did: number, lang: string, lingqs: Lingq[]) {
    if (!lingqs?.length || !did) {
      return
    }

    const dates = lingqs.map((lingq) => {
      const question = lingq.term.replace(/\s+/g, '')
      const answer = lingq.hints?.[0].text ?? ''
      const note = {
        uid: uid,
        did: did,
        question: question,
        answer: answer,
        source: 'lingq',
        sourceId: String(lingq.pk),
        extend: JSON.stringify({
          pk: lingq.pk,
          term: question,
          fragment: lingq.fragment,
          notes: lingq.notes,
          words: lingq.words,
          hints: lingq.hints,
          tags: lingq.tags,
          transliteration: lingq.transliteration,
          lang: lang,
        }),
      } satisfies Insertable<NoteTable>
      return note
    })

    const sourceIds = dates.map((date) => date.sourceId)

    return noteService.createNotes(uid, did, 'lingq', sourceIds, dates)
  }

  async syncLingqs(uid: number, did: number, lingqInfo: { token: string; lang: string }, next?: number) {
    const data = await getLingqs({
      language: lingqInfo.lang as languageCode,
      token: lingqInfo.token,
      page: next,
      page_size: 50,
      search_criteria: 'startsWith',
      sort: 'date',
      status: ['0', '1', '2', '3'],
    })
    const promise: Promise<unknown>[] = []

    if (data.next != null) {
      const page = new URL(data.next).searchParams.get('page')
      promise.push(this.syncLingqs(uid, did, lingqInfo, Number(page)))
    }
    promise.push(this.sync(uid, did, lingqInfo.lang, data.results))
    await Promise.all(promise)
  }

  async getLingqLanguageCode(token: string) {
    const contexts = await getLingqContext({ token: token })
    return contexts.results.map((context) => context.language.code as languageCode)
  }
}

export const lingqService = new LingqService()
export default lingqService
