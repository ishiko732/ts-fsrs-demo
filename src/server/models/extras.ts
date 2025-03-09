import { BaseModel } from '@libs/table'
import type { ColumnType, Generated, JSONColumnType } from 'kysely'

export interface ExtraTable {
  id: Generated<number>
  uid: number
  did: number
  
  name: string
  description: string
  extra: JSONColumnType<object>
  deleted: ColumnType<never, boolean, boolean>
  created: ColumnType<number, number, never>
  updated: number
}

class ParametersModel extends BaseModel<'extras', 'id'> {
  constructor() {
    super('extras', 'id')
  }
}

export const parametersModel = new ParametersModel()
export default parametersModel
