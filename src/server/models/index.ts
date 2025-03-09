import type { CardTable } from './cards'
import type { DeckTable } from './decks'
import type { ExtraTable } from './extras'
import type { NoteTable } from './notes'
import type { RevlogTable } from './revlog'
import type { UserTable } from './users'

export interface Database {
  users: UserTable

  extras: ExtraTable

  decks: DeckTable
  notes: NoteTable
  cards: CardTable
  revlog: RevlogTable
}
