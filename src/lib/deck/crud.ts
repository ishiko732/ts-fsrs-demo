import {
  addDeckAction,
  deleteDeckAction,
  getDecksAction,
  getParamsByUserIdAction,
  updateDeckAction,
} from '@actions/userDeckService';
import { Deck } from '@prisma/client';

// allow server/client use this class
export class DeckCrud {
  async getList() {
    return await getDecksAction();
  }
  async get(did: number) {
    return await getParamsByUserIdAction(did);
  }

  async create(deck: Omit<Deck, 'did' | 'uid' | 'deleted'>) {
    return await addDeckAction(deck);
  }

  async update(deck: Omit<Deck, 'did' | 'uid' | 'deleted'>) {
    return await updateDeckAction(deck);
  }
  async delete(did: number, move: boolean) {
    // move: true => move to default deck
    // move: false => delete permanently(soft)
    return await deleteDeckAction(did, move);
  }
}
