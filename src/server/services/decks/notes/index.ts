import type { Database } from '@server/models'
import cardModel from '@server/models/cards'
import noteModel from '@server/models/notes'
import revlogModel from '@server/models/revlog'
import { type SelectQueryBuilder } from 'kysely'

class NoteService {
  private buildQuery<S>(request: ISearchNoteProps, query: SelectQueryBuilder<Database, 'notes', S>) {
    return query
      .where('uid', '=', request.uid)
      .$if(typeof request.deleted === 'boolean', (q) => q.where('notes.deleted', '=', request.deleted!))
      .$if(!!request.question, (q) => q.where('notes.question', 'ilike', `%${request.question}%`))
      .$if(!!request.answer, (q) => q.where('notes.answer', 'ilike', `%${request.answer}%`))
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
}

export const noteService = new NoteService()

export default noteService
