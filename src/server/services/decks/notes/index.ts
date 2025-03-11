import type { Database } from '@server/models'
import noteModel from '@server/models/notes'
import { type SelectQueryBuilder, sql } from 'kysely'
import { DECAY, FACTOR } from 'ts-fsrs'

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
      .selectFrom('cards')
      .innerJoin('notes', 'notes.id', 'cards.nid')
      .select([
        'cards.id as cid',
        'notes.id as nid',
        'notes.question',
        'notes.answer',
        'notes.source',
        'notes.sourceId',
        'notes.created',
        'notes.updated',
        'cards.stability',
        'cards.difficulty',
        'cards.reps',
        'cards.last_review',
        'cards.suspended',
        sql<number>`ROUND(
            POWER(
              1 + ((((EXTRACT(EPOCH FROM NOW()) * 1000)::bigint - cards.last_review) / 86400000.0) * ${FACTOR})
              / NULLIF(cards.stability, 0),
              ${DECAY}
            )::numeric,
            8
          )`.as('retrievability'),
        'cards.deleted',
      ])
      .offset(page.pageSize * (page.page - 1))
      .limit(page.pageSize)
      .$if(!!orderBy.question, (q) => q.orderBy('notes.question', request.order?.question))
      .$if(!!orderBy.answer, (q) => q.orderBy('notes.answer', request.order?.answer))
      .$if(!!orderBy.source, (q) => q.orderBy('notes.source', request.order?.source))
      .$if(!!orderBy.due, (q) => q.orderBy('cards.due', request.order?.due))
      .$if(!!orderBy.state, (q) => q.orderBy('cards.state', request.order?.state))
      .$if(!!orderBy.reps, (q) => q.orderBy('cards.reps', request.order?.reps))
      .$if(!!orderBy.stability, (q) => q.orderBy('cards.stability', request.order?.stability))
      .$if(!!orderBy.difficulty, (q) => q.orderBy('cards.difficulty', request.order?.difficulty))
      .$if(!!orderBy.retrievability, (q) => q.orderBy('retrievability', request.order?.retrievability))
      .orderBy('cards.id', request.order?.cid ?? 'desc')

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
