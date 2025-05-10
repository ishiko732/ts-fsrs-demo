import { BaseModel } from '@libs/table'
import type { ColumnType, Generated, JSONColumnType } from 'kysely'
import type { FSRSParameters } from 'ts-fsrs'

export interface DeckTable {
  id: Generated<number>
  uid: ColumnType<number, number, never>

  name: string
  description: string
  fsrs: JSONColumnType<FSRSParameters>
  card_limit: JSONColumnType<{
    new: number
    review: number
    learning: number
    suspended: number
  }>
  deleted: ColumnType<boolean, never, boolean>
  created: ColumnType<number, number | undefined, never>
  updated: ColumnType<number, number | undefined, number | undefined>
}

class DeckModel extends BaseModel<'decks'> {
  constructor() {
    super('decks')
  }
}

export const deckModel = new DeckModel()
export default deckModel
