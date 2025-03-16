import { BaseModel } from '@libs/table'
import type { ColumnType, Generated, JSONColumnType } from 'kysely'

export interface ExtraTable {
  id: Generated<number>
  uid: number
  did: number

  name: string
  description: string
  extra: JSONColumnType<Record<string, unknown>>
  deleted: ColumnType<never, boolean, boolean>
  created: ColumnType<number, number | undefined, never>
  updated: ColumnType<number, number | undefined, number | undefined>
}

class ExtraModel extends BaseModel<'extras', 'id'> {
  constructor() {
    super('extras', 'id')
  }
}

export const extraModel = new ExtraModel()
export default extraModel
