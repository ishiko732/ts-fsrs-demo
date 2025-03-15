import { BaseModel } from '@libs/table'
import type { ColumnType, Generated, JSONColumnType } from 'kysely'

export interface DeckTable {
  id: Generated<number>
  uid: ColumnType<number, number, never>

  name: string
  description: string
  fsrs: JSONColumnType<{
    request_retention: number
    maximum_interval: number
    w: number[]
    enable_fuzz: boolean
    enable_short_term: boolean
  }>
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
