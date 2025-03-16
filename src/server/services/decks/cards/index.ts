import type { Database } from '@server/models'
import cardModel from '@server/models/cards'
import noteModel from '@server/models/notes'
import revlogModel from '@server/models/revlog'
import { type SelectQueryBuilder, sql } from 'kysely'
import { DECAY, FACTOR } from 'ts-fsrs'

class CardService {
  private buildQuery<S>(request: ISearchNoteProps, query: SelectQueryBuilder<Database, 'notes' | 'cards', S>) {
    return query
      .where('cards.uid', '=', request.uid)
      .$if(typeof request.deleted === 'boolean', (q) => {
        return q.where('notes.deleted', '=', request.deleted!)
      })
      .$if(!!request.question, (q) => q.where('notes.question', 'ilike', `%${request.question}%`))
      .$if(!!request.answer, (q) => q.where('notes.answer', 'ilike', `%${request.answer}%`))
  }

  private buildOrder<S>(request: ISearchNoteProps, query: SelectQueryBuilder<Database, 'notes' | 'cards', S>) {
    const orderBy = request.order ?? {}
    return (
      query
        // @ts-expect-error - `retrievability` is not a column in the database
        .orderBy('retrievability', request.order?.retrievability ?? 'desc')
        .orderBy('cards.id', request.order?.cid ?? 'desc')
        .$if(!!orderBy.question, (q) => q.orderBy('notes.question', request.order?.question))
        .$if(!!orderBy.answer, (q) => q.orderBy('notes.answer', request.order?.answer))
        .$if(!!orderBy.source, (q) => q.orderBy('notes.source', request.order?.source))
        .$if(!!orderBy.due, (q) => q.orderBy('cards.due', request.order?.due))
        .$if(!!orderBy.state, (q) => q.orderBy('cards.state', request.order?.state))
        .$if(!!orderBy.reps, (q) => q.orderBy('cards.reps', request.order?.reps))
        .$if(!!orderBy.stability, (q) => q.orderBy('cards.stability', request.order?.stability))
        .$if(!!orderBy.difficulty, (q) => q.orderBy('cards.difficulty', request.order?.difficulty))
    )
  }
  async getList(request: ISearchNoteProps): Promise<PageList<ICardListData>> {
    const count_query = this.buildQuery(
      request,
      noteModel.db
        .selectFrom('cards')
        .innerJoin('notes', 'notes.id', 'cards.nid')
        .select((b) => b.fn.count('notes.id').as('count')),
    )

    const { count } = await count_query.executeTakeFirstOrThrow()
    const page = request.page
    if (Number(count) === 0) {
      return { pagination: { page: page.page, pageSize: page.pageSize, total: 0 }, data: [] }
    }

    const data_query = this.buildOrder(
      request,
      this.buildQuery(
        request,
        noteModel.db
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
            sql<number | string>`COALESCE(ROUND(
            POWER(
              1 + ((((EXTRACT(EPOCH FROM NOW()) * 1000)::bigint - cards.last_review) / 86400000.0) * ${FACTOR})
              / NULLIF(cards.stability, 0),
              ${DECAY}
            )::numeric,
            8
          ),0)`.as('retrievability'),
            'cards.deleted',
          ])
          .offset(page.pageSize * (page.page - 1))
          .limit(page.pageSize),
      ),
    )

    const data = await data_query.execute()

    return {
      pagination: { page: page.page, pageSize: page.pageSize, total: Number(count) },
      data: data.map((d) => {
        d.retrievability = Number(d.retrievability)
        return d as ICardListData
      }),
    }
  }

  async getDetail(uid: number, nid: number, cid?: number, deleted: boolean = false) {
    const data_promise = cardModel.db
      .selectFrom('cards')
      .innerJoin('notes', 'notes.id', 'cards.nid')
      .selectAll()
      .select('cards.id as cid')
      .select('notes.id as nid')
      .where('cards.uid', '=', uid)
      .where('cards.nid', '=', nid)
      .$if(!!cid, (q) => q.where('cards.id', '=', cid!))
      .where('cards.deleted', '=', deleted)

    const logs_promise = revlogModel.db
      .selectFrom('revlog')
      .selectAll()
      .where('uid', '=', uid)

      .where('deleted', '=', deleted)
    if (cid) {
      const [card, logs] = await Promise.all([
        data_promise.where('cards.id', '=', cid).executeTakeFirstOrThrow(),
        logs_promise.where('cid', '=', cid).execute(),
      ])
      return {
        card,
        logs,
      }
    } else {
      const cards = await data_promise.executeTakeFirstOrThrow()
      const logs = await logs_promise.where('cid', '=', cards.id).execute()
      return {
        card: cards,
        logs,
      }
    }
  }
}

export const cardService = new CardService()
export type CardServiceType = typeof cardService
export type TCardDetail = Awaited<ReturnType<CardServiceType['getDetail']>>['card']

export default cardService
