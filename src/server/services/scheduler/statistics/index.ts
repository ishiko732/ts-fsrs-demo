import cardModel from '@server/models/cards'
import revlogModel from '@server/models/revlog'
import { State } from 'ts-fsrs'

class StatisticsService {
  /**
   * Get the number of revlogs within the statistical range.
   */
  async getRangeRevlogCount(
    uid: number,
    range: [number, number],
    state: State[] = [State.New],
    dids: number[] = [],
  ): Promise<Map<State, number>> {
    const query = await revlogModel.db
      .selectFrom('revlog as r')
      .select((q) => q.fn.count<string>('r.id').as('count'))
      .select('r.state')
      .innerJoin(cardModel.table, (q) => {
        return q
          .onRef('cards.id', '=', 'r.cid')
          .on((eb) => eb.and([eb('cards.uid', '=', uid), eb('cards.deleted', '=', false), eb('cards.suspended', '=', false)]))
      })
      .where('r.uid', '=', uid)
      .where('r.deleted', '=', false)
      .where('r.state', 'in', state)
      .$if(Array.isArray(dids) && dids.length > 0, (q) => q.where('r.did', 'in', dids))
      .where('r.review', '>=', range[0])
      .where('r.review', '<', range[1])
      .groupBy('r.state')
      .execute()

    const map = new Map<State, number>()
    const states = [State.New, State.Learning, State.Relearning, State.Review]
    for (const state of states) {
      map.set(state, Number(query[state]?.count ?? 0))
    }
    console.debug(map)
    return map
  }
}

export const statisticsService = new StatisticsService()
export default statisticsService
