import {
  addCardAction,
  deleteCardAction,
  getCardByCardIdAction,
  getCardByNoteIdAndOrderIdAction,
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
  async get(cid: number): Promise<Card> {
    const res = await getCardByCardIdAction(cid);
    if (!res) {
      throw new Error('Card not found');
    }
    return res;
  }
  async getByNote(nid: number, orderId: number): Promise<Card | null> {
    return getCardByNoteIdAndOrderIdAction(nid, orderId);
  }

  async create(
    nid: number,
    card: Omit<Card, 'nid' | 'deleted' | 'orderId' | 'uid' | 'cid'>,
    orderId: number = 0
  ) {
    return await addCardAction(nid, card, orderId);
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
