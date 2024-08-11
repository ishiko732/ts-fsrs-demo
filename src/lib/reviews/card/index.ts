import { FSRS, RecordLog, Grade, FSRSParameters, fsrs, Card } from 'ts-fsrs';
import { ICardService } from '../type';
import { Card as PrismaCard } from '@prisma/client';
import { cardCrud } from '@lib/container';
import { createEmptyCardByPrisma } from './fsrsToPrisma';
import { rollbackAction, schdulerAction } from '@actions/userCardService';

export class CardService implements ICardService {
  private f: FSRS;
  private cards: Map<number, PrismaCard> = new Map();
  private box: number[] = [];
  private preview_start: number = 0;
  private deckId = 0;
  constructor(deckId: number, parameters?: FSRSParameters) {
    this.f = fsrs(parameters);
    this.deckId = deckId;
  }

  async create(nid: number, orderId: number): Promise<PrismaCard> {
    const empty_card = createEmptyCardByPrisma();
    const card = await cardCrud.create(nid, empty_card, orderId);
    this.cards.set(card.cid, card);
    return card;
  }

  async getCard(cid: number): Promise<PrismaCard> {
    let card = this.cards.get(cid);
    if (!card) {
      card = await cardCrud.get(cid);
      this.cards.set(card.cid, card);
    }
    return card;
  }
  async preview(cid: number, now: Date): Promise<RecordLog> {
    const card = await this.getCard(cid);
    const record = this.f.repeat(card, now);
    this.preview_start = new Date().getTime();
    return record;
  }
  async schduler(cid: number, now: Date, grade: Grade) {
    const duration = Math.round((now.getTime() - this.preview_start) / 1000);
    this.box.push(cid);
    const schduler = await schdulerAction(
      this.deckId,
      cid,
      now.getTime(),
      grade,
      duration
    );
    return schduler;
  }
  async rollback() {
    const last_cid = this.box.pop();
    if (last_cid === undefined) {
      return null;
    }
    const rollback = await rollbackAction(this.deckId, last_cid);
    return rollback;
  }
}
