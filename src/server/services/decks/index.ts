import deckModel, { type DeckTable } from '@server/models/decks'
import type { Insertable, Selectable, Updateable } from 'kysely'
import { generatorParameters } from 'ts-fsrs'

import { initDeck } from '../scheduler/init'

class DeckService {
  async getDefaultDeck(uid: number): Promise<number> {
    const deck = await deckModel.db
      .selectFrom('decks')
      .select('decks.id')
      .where('uid', '=', uid)
      .where('decks.deleted', '=', false)
      .orderBy('id')
      .executeTakeFirst()
    if (deck) {
      return deck.id
    }
    const init_deck_data = initDeck(uid, new Date(), 'default deck', '')
    return this.addDeck(uid, init_deck_data)
  }

  async addDeck(uid: number, deck: Omit<Insertable<DeckTable>, 'uid'>): Promise<number> {
    const now = Date.now()
    const deck_data = {
      ...deck,
      uid,
      created: now,
      updated: now,
    }
    const { id } = await deckModel.db.insertInto('decks').values(deck_data).returning('id').executeTakeFirstOrThrow()
    return id
  }

  async getDeck(uid: number, did: number): Promise<Selectable<DeckTable>> {
    const deck = await deckModel.db
      .selectFrom('decks')
      .selectAll()
      .where('uid', '=', uid)
      .where('id', '=', did)
      .where('decks.deleted', '=', false)
      .orderBy('id')
      .executeTakeFirstOrThrow()
    // migrate fsrs parameters to FSRS-6
    deck.fsrs = generatorParameters(deck.fsrs)
    return deck
  }

  async modifyDeck(uid: number, deck: Partial<Updateable<DeckTable>>, did?: number): Promise<number> {
    const now = Date.now()
    const updated = await deckModel.db
      .updateTable(deckModel.table)
      .set({ ...deck, updated: now })
      .where('uid', '=', uid)
      .$if(!!did, (q) => q.where('id', '=', did!))
      .executeTakeFirst()
    return Number(updated.numUpdatedRows)
  }
}

export const deckService = new DeckService()

export default deckService
