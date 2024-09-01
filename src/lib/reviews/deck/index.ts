import { FSRSParameters } from 'ts-fsrs';
import { Deck } from '@prisma/client';
import { DeckMemoryContext, IDeckService, NoteMemoryContext } from '../type';
import {
  getReviewMemoryContextAction,
  getNumberOfNewCardsLearnedTodayAction,
} from '@actions/userDeckService';
import { computedToday } from './crud';
import { memoryPageSize, states_prisma } from '@/constant';
import { deckCrud } from '@lib/container';
import { getUserTimeZone } from '@actions/userTimezone';
import { toastEmitter } from '@hooks/useToastListeners';

export class DeckService implements IDeckService {
  private deck: Omit<Deck, 'deleted'> | undefined;
  private algorithm_params: FSRSParameters | undefined;
  startTimestamp: number = 0;
  nextTimestamp: number = 0;
  noteContext = {} as NoteMemoryContext;
  page: number = 1;
  pageSize = memoryPageSize;
  private reset_cnt = 0;
  constructor(private deckId: number = 0) {}
  reset(): void {
    this.deck = undefined;
    this.algorithm_params = undefined;
    this.noteContext = {} as NoteMemoryContext;
    this.page = 1;
    this.pageSize = memoryPageSize;
    if (this.reset_cnt++) {
      toastEmitter.emitToast({
        title: `Deck Service - #${this.reset_cnt}`,
        description: 'reset success',
      });
    }
  }

  init = (deckId: number) => {
    this.deckId = deckId;
    if (this.deck) {
      this.deck = undefined;
      this.algorithm_params = undefined;
    }
  };
  getDeck = async () => {
    if (!this.deck) {
      this.deck = await deckCrud.get(this.deckId);
      this.algorithm_params = this.deck.fsrs as object as FSRSParameters;
    }
    return this.deck;
  };

  getAlgorithmParams = async () => {
    if (!this.deck) {
      await this.getDeck();
    }
    if (!this.algorithm_params) {
      throw new Error('deck not found');
    }
    return this.algorithm_params;
  };

  getTodayMemoryContext = async (
    pageSize: number = memoryPageSize
  ): Promise<DeckMemoryContext> => {
    const userTimezone = await getUserTimeZone();
    const { startTimestamp, nextTimestamp, startOfDay, nextOfDay } =
      computedToday(userTimezone.timezone, userTimezone.hourOffset);

    const deck = await this.getDeck();
    const count = await getNumberOfNewCardsLearnedTodayAction(
      this.deckId,
      startTimestamp,
      nextTimestamp
    );

    const noteContext: NoteMemoryContext = await getReviewMemoryContextAction(
      deck.did,
      startTimestamp,
      nextTimestamp,
      pageSize,
      1
    );

    return {
      uid: deck.uid,
      deckId: deck.did,
      deckName: deck.name,
      timezone: userTimezone.timezone,
      hoursOffset: userTimezone.hourOffset,
      startTimestamp,
      nextTimestamp,
      userNewCardlimit: deck.card_limit,
      deckTodayLearnedcount: count,
      noteContext: noteContext,
      lapsers: deck.lapses,
    } satisfies DeckMemoryContext;
  };

  hydrate = (context: DeckMemoryContext) => {
    this.startTimestamp = context.startTimestamp;
    this.nextTimestamp = context.nextTimestamp;
    this.page = context.noteContext.loadPage;
    this.noteContext = context.noteContext;
    this.pageSize = context.noteContext.pageSize;
  };

  todayMemoryContextPage = async (
    page: number,
    ignoreCardIds: number[] = []
  ): Promise<NoteMemoryContext> => {
    if ((page ?? 0) < 1) {
      throw new Error('page must be greater than 0');
    }
    const noteContext: NoteMemoryContext = await getReviewMemoryContextAction(
      this.deckId,
      this.startTimestamp,
      this.nextTimestamp,
      this.pageSize,
      page,
      ignoreCardIds
    );
    return noteContext;
  };
}
