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
import { rollbackAction, schedulerAction } from '@actions/userCardService';
import EventEmitter from 'events';
import { DEFAULT_DECK_ID, LAPSES, StateBox } from '@/constant';
import { nextAfterHandler } from './fsrsToPrisma/handler';
import { toastEmitter } from '@hooks/useToastListeners';

export class CardService extends EventEmitter implements ICardService {
  private f: FSRS;
  private cards: Map<number, PrismaCard> = new Map();
  private box: number[] = [];
  private preview_start: number = 0;
  private deckId;
  private lapses;
  private reset_cnt = 0;
  constructor(deckId: number, lapses: number, parameters?: FSRSParameters) {
    super();
    this.f = fsrs(parameters);
    this.deckId = deckId;
    this.lapses = lapses;
  }
  reset(): void {
    this.deckId = DEFAULT_DECK_ID;
    this.lapses = LAPSES;
    this.cards = new Map();
    this.box = [];
    this.preview_start = 0;
    if(this.reset_cnt++){
      toastEmitter.emitToast({
        title:`Card Service - #${this.reset_cnt}`,
        description: 'reset success',
      })
    }
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
  async scheduler(cid: number, now: Date, grade: Grade) {
    const duration = Math.round((now.getTime() - this.preview_start) / 1000);
    this.box.push(cid);
    const scheduler = schedulerAction(
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
    return scheduler;
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
      const state =
        card.state === PrismaState.Relearning
          ? PrismaState.Learning
          : card.state;
      boxes[state].push(card);
    }
    console.debug('hydrate card', cards.map((c) => c.cid).join(','));
    this.emit('full block', boxes);
  }

  async getDSR(cid: number) {
    const card = await this.getCard(cid, { emit: false });
    const now = new Date();
    const r = this.f.get_retrievability(card, now, true);
    return {
      D: card.difficulty,
      S: card.stability,
      R: r,
    };
  }

  getLoadedCardIds = () => {
    return Array.from(this.cards.keys());
  };
}
