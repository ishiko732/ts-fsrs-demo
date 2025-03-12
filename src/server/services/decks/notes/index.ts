import type { Database } from '@server/models'
import noteModel from '@server/models/notes'
import { type SelectQueryBuilder } from 'kysely'

class NoteService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildQuery(request: ISearchNoteProps, query: SelectQueryBuilder<Database, 'notes' | 'cards', any>) {
    query
      .where('uid', '=', request.uid)
      .$if(typeof request.deleted === 'boolean', (q) => q.where('notes.deleted', '=', request.deleted!))
      .$if(!!request.question, (q) => q.where('notes.question', 'ilike', `%${request.question}%`))
      .$if(!!request.answer, (q) => q.where('notes.answer', 'ilike', `%${request.answer}%`))
  }
  async getList(request: ISearchNoteProps): Promise<PageList<INoteListData>> {
    const count_query = noteModel.db
      .selectFrom('cards')
      .leftJoin('notes', 'notes.id', 'cards.nid')
      .select((b) => b.fn.count('notes.id').as('count'))
    this.buildQuery(request, count_query)
    const { count } = await count_query.executeTakeFirstOrThrow()
    const page = request.page
    if (Number(count) === 0) {
      return { pagination: { page: page.page, pageSize: page.pageSize, total: 0 }, data: [] }
    }

    const orderBy = request.order ?? {}
    const data_query = noteModel.db
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
      .orderBy('notes.id', request.order?.nid ?? 'desc')

    this.buildQuery(request, data_query)
    const data = await data_query.execute()

    return {
      pagination: { page: page.page, pageSize: page.pageSize, total: Number(count) },
      data: data,
    }
  }
}

export const noteService = new NoteService()

export default noteService
