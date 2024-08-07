import {
  addCardAction,
  deleteCardAction,
  getCardByCardIdAction,
  getCardsAction,
  restoreCardAction,
  updateCardAction,
} from '@actions/userCardService';
import { Card } from '@prisma/client';

// allow server/client use this class
export class CardCrud {
  async getList(nid: number): Promise<Card[]> {
    return await getCardsAction(nid);
  }
  async get(cid: number) {
    const res = await getCardByCardIdAction(cid);
    if (!res) {
      throw new Error('Note not found');
    }
    return res;
  }

  async create(nid: number, card: Omit<Card, 'nid' | 'deleted' | 'orderId'>) {
    return await addCardAction(nid, card);
  }

  async update(cid: number, card: Omit<Card, 'nid' | 'deleted' | 'orderId'>) {
    return await updateCardAction(cid, card);
  }
  async delete(cid: number) {
    return await deleteCardAction(cid);
  }

  async restore(did: number) {
    return await restoreCardAction(did);
  }
}
