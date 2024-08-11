import { fsrs, FSRSParameters } from 'ts-fsrs';
import { Deck } from '@prisma/client';
import {
  DeckMemoryContext,
  IDeckService,
  NoteMemoryContext,
  SearchTodayMemoryContextPage,
} from '../type';
import {
  getReviewMemoryContextAction,
  getNumberOfNewCardsLearnedTodayAction,
} from '@actions/userDeckService';
import { computedToday } from './crud';
import { memoryPageSize, states_prisma } from '@/constant';
import { deckCrud } from '@lib/container';
import { getUserTimeZone } from '@actions/userTimezone';

export class DeckService implements IDeckService {
  private deck: Omit<Deck, 'deleted'> | undefined;
  private algorithm_pamars: FSRSParameters | undefined;
  constructor(private deckId: number = 0) {}
  getDeck = async () => {
    if (!this.deck) {
      this.deck = await deckCrud.get(this.deckId);
      this.algorithm_pamars = JSON.parse(
        this.deck.fsrs as string
      ) as FSRSParameters;
    }
    return this.deck;
  };

  getAlgorithmParams = async () => {
    if (!this.deck) {
      await this.getDeck();
    }
    if (!this.algorithm_pamars) {
      throw new Error('deck not found');
    }
    return this.algorithm_pamars;
  };

  getTodayMemoryContext = async (): Promise<DeckMemoryContext> => {
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
      memoryPageSize,
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

  todayMemoryContextPage = async ({
    deckId,
    startTimestamp,
    nextTimestamp,
    page,
    pageSize = memoryPageSize,
    ignoreCardIds,
  }: SearchTodayMemoryContextPage): Promise<NoteMemoryContext> => {
    if ((page ?? 0) < 1) {
      throw new Error('page must be greater than 0');
    }
    const noteContext: NoteMemoryContext = await getReviewMemoryContextAction(
      deckId,
      startTimestamp,
      nextTimestamp,
      pageSize,
      page,
      ignoreCardIds
    );
    return noteContext;
  };
}
