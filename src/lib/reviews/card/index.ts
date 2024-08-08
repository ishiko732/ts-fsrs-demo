import { FSRS, RecordLog, Grade, FSRSParameters, fsrs, Card } from 'ts-fsrs';
import { ICardService } from '../type';
import { Card as PrismaCard } from '@prisma/client';
import { cardCrud } from '@lib/container';
import { createEmptyCardByPrisma } from './fsrsToPrisma';

class CardService implements ICardService {
  private f: FSRS;
  private cards: Map<number, PrismaCard> = new Map();
  private box: number[] = [];
  private preview_start: number = 0;
  constructor(parameters: FSRSParameters) {
    this.f = fsrs(parameters);
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
  async schduler(cid: number, now: Date, grade: Grade): Promise<boolean> {
    const duration = Math.round((now.getTime() - this.preview_start) / 1000);
    this.box.push(cid);
    throw new Error('Method not implemented.');
  }
  async rollback(): Promise<boolean> {
    const last = this.box.pop();
    if (last === undefined) {
      return false;
    }
    // restore card
    throw new Error('Method not implemented.');
  }
}
