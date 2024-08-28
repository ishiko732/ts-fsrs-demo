import { FSRS, RecordLog, Grade, FSRSParameters, fsrs } from 'ts-fsrs';
import {
  ICardService,
  TEmitOption,
  TEmitCardScheduler,
  TEmitCardRollback,
} from '../type';
import { Card as PrismaCard, State as PrismaState } from '@prisma/client';
import { cardCrud } from '@lib/container';
import { createEmptyCardByPrisma } from './fsrsToPrisma';
import { rollbackAction, schdulerAction } from '@actions/userCardService';
import EventEmitter from 'events';
import { StateBox } from '@/constant';
import { nextAfterHandler } from './fsrsToPrisma/handler';

export class CardService extends EventEmitter implements ICardService {
  private f: FSRS;
  private cards: Map<number, PrismaCard> = new Map();
  private box: number[] = [];
  private preview_start: number = 0;
  private deckId;
  private lapses;
  constructor(deckId: number, lapses: number, parameters?: FSRSParameters) {
    super();
    this.f = fsrs(parameters);
    this.deckId = deckId;
    this.lapses = lapses;
  }

  init(deckId: number, lapses: number, parameters?: FSRSParameters) {
    this.f = fsrs(parameters);
    this.deckId = deckId;
    this.lapses = lapses;
  }

  async create(nid: number, orderId: number): Promise<PrismaCard> {
    const empty_card = createEmptyCardByPrisma();
    if (nid === 0) {
      console.error('nid is 0');
      return {
        ...empty_card,
        uid: 0,
        orderId: 0,
        deleted: false,
        cid: 0,
        nid: 0,
      };
    }
    const card = await cardCrud.create(nid, empty_card, orderId);
    this.cards.set(card.cid, card);
    this.emit('current', card.state, card.cid);
    return card;
  }

  async getCard(cid: number, option?: TEmitOption): Promise<PrismaCard> {
    let card = this.cards.get(cid);
    if (!card) {
      card = await cardCrud.get(cid);
      this.cards.set(card.cid, card);
    }
    if (option?.emit ?? true) {
      this.emit('current', card.state, cid);
    }
    return card;
  }
  async preview(cid: number, now: Date): Promise<RecordLog> {
    const card = await this.getCard(cid, { emit: false });
    const record = this.f.repeat(card, now);
    this.preview_start = new Date().getTime();
    this.emit('preview', card);
    return record;
  }
  async schduler(cid: number, now: Date, grade: Grade) {
    const duration = Math.round((now.getTime() - this.preview_start) / 1000);
    this.box.push(cid);
    const schduler = schdulerAction(
      this.deckId,
      cid,
      now.getTime(),
      grade,
      duration
    );
    const afterHandler = nextAfterHandler.bind(this, this.lapses);
    const card = this.cards.get(cid)!;
    const record = this.f.next(card, now, grade, afterHandler);
    this.emit('scheduler', {
      currentState: card.state,
      nextState: record.card.state,
      nextDue: new Date(record.card.due).getTime(),
      did: this.deckId,
      nid: card.nid as number,
      cid: card.cid,
      orderId: card.orderId,
    } satisfies TEmitCardScheduler);
    return schduler;
  }
  async rollback() {
    const last_cid = this.box.pop();
    if (last_cid === undefined) {
      console.warn('no card to rollback');
      return null;
    }
    const rollback = await rollbackAction(this.deckId, last_cid);
    const card = await cardCrud.get(last_cid);
    this.cards.set(card.cid, card);
    this.emit('rollback', {
      did: this.deckId,
      cid: last_cid,
      orderId: card.orderId,
      nid: card.nid,
      nextState: rollback.nextState,
      nextDue: rollback.nextDue,
    } satisfies TEmitCardRollback);
    return rollback;
  }

  async hydrate(cards: PrismaCard[]): Promise<void> {
    const boxes = {
      [PrismaState.New]: [],
      [PrismaState.Learning]: [],
      [PrismaState.Review]: [],
    } as Record<StateBox, PrismaCard[]>;
    for (const card of cards) {
      this.cards.set(card.cid, card);
      console.debug('hydrate card', card.cid);
      const state =
        card.state === PrismaState.Relearning
          ? PrismaState.Learning
          : card.state;
      boxes[state].push(card);
    }
    this.emit('full block', boxes);
  }

  getLoadedCardIds = () => {
    return Array.from(this.cards.keys());
  };
}
