import { BaseModel } from '@libs/table'
import type { ColumnType, Generated, JSONColumnType } from 'kysely'

export interface NoteTable {
  id: Generated<number>
  uid: ColumnType<number, number, never>
  did: number

  question: string
  answer: string
  source: string
  sourceId?: string
  extend: JSONColumnType<object>
  deleted: ColumnType<boolean, never, boolean>
  created: ColumnType<number, number | undefined, never>
  updated: ColumnType<number, number | undefined, number | undefined>
}

class NoteModel extends BaseModel<'notes'> {
  constructor() {
    super('notes')
  }
}

export const noteModel = new NoteModel()
export default noteModel
