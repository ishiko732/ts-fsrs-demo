import type { Database } from '@server/models'
import cardModel from '@server/models/cards'
import noteModel, { type NoteTable } from '@server/models/notes'
import revlogModel from '@server/models/revlog'
import { initCard } from '@server/services/scheduler/init'
import { type Insertable, type Selectable, type SelectQueryBuilder, type Updateable } from 'kysely'
import { createEmptyCard } from 'ts-fsrs'

class NoteService {
  private buildQuery<S>(request: ISearchNoteProps, query: SelectQueryBuilder<Database, 'notes', S>) {
    return query
      .where('uid', '=', request.uid)
      .$if(typeof request.deleted === 'boolean', (q) => q.where('notes.deleted', '=', request.deleted!))
      .$if(!!request.keyword, (q) =>
        q.where((eb) => eb('notes.question', 'ilike', `%${request.keyword}%`).or('notes.answer', 'ilike', `%${request.keyword}%`)),
      )
  }
  async getList(request: ISearchNoteProps): Promise<PageList<INoteListData>> {
    const count_query = this.buildQuery(
      request,
      noteModel.db.selectFrom('notes').select((b) => b.fn.count('notes.id').as('count')),
    )
    const { count } = await count_query.executeTakeFirstOrThrow()
    const page = request.page
    if (Number(count) === 0) {
      return { pagination: { page: page.page, pageSize: page.pageSize, total: 0 }, data: [] }
    }

    const orderBy = request.order ?? {}
    const data_query = this.buildQuery(
      request,
      noteModel.db
        .selectFrom('notes')
        .select([
          'notes.id as nid',
          'notes.question',
          'notes.answer',
          'notes.source',
          'notes.sourceId',
          'notes.created',
          'notes.updated',
          'notes.deleted',
        ])
        .offset(page.pageSize * (page.page - 1))
        .limit(page.pageSize)
        .$if(!!orderBy.question, (q) => q.orderBy('notes.question', request.order?.question))
        .$if(!!orderBy.answer, (q) => q.orderBy('notes.answer', request.order?.answer))
        .$if(!!orderBy.source, (q) => q.orderBy('notes.source', request.order?.source))
        .orderBy('notes.id', request.order?.nid ?? 'desc'),
    )

    const data = await data_query.execute()

    return {
      pagination: { page: page.page, pageSize: page.pageSize, total: Number(count) },
      data: data,
    }
  }

  async switch_delete(uid: number, nids: number[], deleted: boolean) {
    return noteModel.db.transaction().execute(async (trx) => {
      const exec_nids = await trx
        .updateTable('notes')
        .set({ deleted })
        .where('uid', '=', uid)
        .where('id', 'in', nids)
        .returning('id')
        .execute()
      if (exec_nids.length !== nids.length) {
        throw new Error('Some notes are not found')
      }
      const exec_cards = trx.updateTable(cardModel.table).set({ deleted }).where('nid', 'in', nids).execute()
      const exec_revlogs = trx.updateTable(revlogModel.table).set({ deleted }).where('nid', 'in', nids).execute()
      await Promise.all([exec_cards, exec_revlogs])
    })
  }

  async getNote(
    uid: number,
    options?: Partial<{
      nid: number
      did: number
      question: string
      answer: string
      source: string
      sourceId: string
    }>,
  ): Promise<Selectable<NoteTable> | undefined> {
    return noteModel.db
      .selectFrom('notes')
      .selectAll()
      .where('uid', '=', uid)
      .$if(!!options?.nid, (q) => q.where('id', '=', options!.nid!))
      .$if(!!options?.did, (q) => q.where('did', '=', options!.did!))
      .$if(!!options?.question, (q) => q.where('question', '=', options!.question!))
      .$if(!!options?.answer, (q) => q.where('answer', '=', options!.answer!))
      .$if(!!options?.source, (q) => q.where('source', '=', options!.source!))
      .$if(!!options?.sourceId, (q) => q.where('sourceId', '=', options!.sourceId))
      .executeTakeFirst()
  }

  async addNote(uid: number, did: number, note: Omit<Insertable<NoteTable>, 'uid' | 'did' | 'id'>): Promise<number> {
    const note_from_db = await this.getNote(uid, { did, question: note.question, answer: note.answer })
    if (note_from_db) {
      throw new Error('Note already exists')
    }
    const now = Date.now()
    return noteModel.db.transaction().execute(async (trx) => {
      const { id: nid } = await trx
        .insertInto('notes')
        .values({ ...note, uid, did, created: now, updated: now })
        .returning('id')
        .executeTakeFirstOrThrow()
      const card_for_fsrs = createEmptyCard(now)
      const card = initCard(uid, did, nid, card_for_fsrs, now)
      await trx.insertInto(cardModel.table).values(card).execute()
      return nid
    })
  }

  async modifyNote(uid: number, nid: number, note: Partial<Updateable<NoteTable>>): Promise<boolean> {
    const note_from_db = await this.getNote(uid, { nid, question: note.question, answer: note.answer, did: note.did })
    if (!note_from_db) {
      throw new Error('Note not found')
    }
    const now = Date.now()
    return noteModel.updateOne(nid, { ...note, updated: now })
  }
}

export const noteService = new NoteService()

export default noteService
