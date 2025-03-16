import deckModel from '@server/models/decks'

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
    const { id } = await deckModel.db.insertInto('decks').values(init_deck_data).returning('id').executeTakeFirstOrThrow()
    return id
  }
}

export const deckService = new DeckService()

export default deckService
