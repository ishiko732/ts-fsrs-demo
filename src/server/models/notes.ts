import { BaseModel } from '@libs/table'
import type { ColumnType, Generated, JSONColumnType } from 'kysely'

export interface NoteTable {
  id: Generated<number>
  uid: ColumnType<number, number, never>
  did: number
  
  question: string
  answer: string
  sourceId?: string
  extend: JSONColumnType<object>
  deleted: ColumnType<never, boolean, boolean>
  created: ColumnType<number, number, never>
  updated: number
}

class NoteModel extends BaseModel<'notes'> {
  constructor() {
    super('notes')
  }
}

export const nodeModel = new NoteModel()
export default nodeModel
