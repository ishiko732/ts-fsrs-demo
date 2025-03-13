import { BaseModel } from '@libs/table'
import type { ColumnType, Generated } from 'kysely'
import type { Rating, State } from 'ts-fsrs'

export interface RevlogTable {
  id: Generated<number>
  uid: ColumnType<number, number, never>
  did: ColumnType<number, number, never>
  cid: ColumnType<number, number, never>

  grade: ColumnType<Rating, Rating, never>
  state: ColumnType<State, State, never>
  due: ColumnType<number, number, never>
  stability: ColumnType<number, number, never>
  difficulty: ColumnType<number, number, never>
  elapsed_days: ColumnType<number, number, never>
  last_elapsed_days: ColumnType<number, number, never>
  scheduled_days: ColumnType<number, number, never>
  review: ColumnType<number, number, never>
  duration: ColumnType<number, number, never>
  offset: ColumnType<number, number, never>
  deleted: ColumnType<boolean, boolean, never>
}

class RevlogModel extends BaseModel<'revlog', 'id'> {
  constructor() {
    super('revlog', 'id')
  }
}

export const revlogModel = new RevlogModel()
export default revlogModel
