import { BaseModel } from '@libs/table'
import type { ColumnType, Generated } from 'kysely'
import type { State } from 'ts-fsrs'

export interface CardTable {
  id: Generated<number>
  uid: number
  did: number
  nid: number

  due: number
  stability: number
  difficulty: number
  elapsed_days: number
  last_elapsed_days: number
  scheduled_days: number
  reps: number
  state: State
  last_review: ColumnType<number | undefined, number | undefined, number>
  suspended: ColumnType<never, boolean, boolean>
  deleted: ColumnType<never, boolean, boolean>
  created: ColumnType<number, number, never>
  updated: number
}

class CardModel extends BaseModel<'cards'> {
  constructor() {
    super('cards')
  }
}

export const cardModel = new CardModel()
export default cardModel
