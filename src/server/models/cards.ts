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
  scheduled_days: number
  reps: number
  lapses: number
  learning_steps: number
  state: State
  last_review: ColumnType<number | undefined, never, number>
  suspended: ColumnType<boolean, never, boolean>
  deleted: ColumnType<boolean, never, boolean>
  created: ColumnType<number, number | undefined, never>
  updated: ColumnType<number, number | undefined, number>
}

class CardModel extends BaseModel<'cards'> {
  constructor() {
    super('cards')
  }
}

export const cardModel = new CardModel()
export default cardModel
