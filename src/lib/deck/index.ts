import { date_scheduler, fsrs, FSRSParameters } from 'ts-fsrs';
import { Deck } from '@prisma/client';
import {
  DeckMemoryContext,
  IDeckService,
  NoteMemoryContext,
  SearchTodayMemoryContextPage,
} from './type';
import {
  getNoteMemoryContextAction,
  getNumberOfNewCardsLearnedTodayAction,
  getParamsByUserIdAction,
} from '@actions/userDeckService';
import { DEFAULT_DECK_ID, states_prisma } from './retriever';
const memoryPageSize = 50;

export class DeckService implements IDeckService {
  private deck: Omit<Deck, 'deleted'> | undefined;
  private algorithm_pamars: FSRSParameters | undefined;
  constructor(private deckId: number = 0) {}
  getDeck = async () => {
    if (!this.deck) {
      const decks = await getParamsByUserIdAction(
        this.deckId ?? DEFAULT_DECK_ID
      );
      if (decks[this.deckId]) {
        this.deck = decks[this.deckId];
      } else {
        this.deck = decks[`${DEFAULT_DECK_ID}`];
      }
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

  getAlgorithm = async () => {
    const params = await this.getAlgorithmParams();
    return fsrs(params);
  };

  getTodayMemoryContext = async (
    timezone: string,
    hourOffset: number
  ): Promise<DeckMemoryContext> => {
    const { startTimestamp, nextTimestamp, startOfDay, nextOfDay } =
      this.computedToday(timezone, hourOffset);

    const deck = await this.getDeck();
    const count = await getNumberOfNewCardsLearnedTodayAction(
      this.deckId,
      startTimestamp,
      nextTimestamp
    );

    const noteContext: NoteMemoryContext = Object.create(null);

    await Promise.all(
      states_prisma.map(async (state) => {
        noteContext[state] = await getNoteMemoryContextAction(
          deck.did,
          state,
          startTimestamp,
          deck.card_limit,
          count,
          memoryPageSize,
          1
        );
      })
    );
    return {
      uid: deck.uid,
      deckId: deck.did,
      timezone,
      startTimestamp,
      nextTimestamp,
      userNewCardlimit: deck.card_limit,
      deckTodayLearnedcount: count,
      noteContext: noteContext,
    } satisfies DeckMemoryContext;
  };

  private computedToday = (timezone: string, hourOffset: number) => {
    const clientTime = Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
    }).format(new Date());
    let currentDate = new Date(clientTime);
    if (currentDate.getHours() < hourOffset) {
      currentDate = date_scheduler(currentDate, -1, true);
    }
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hourOffset,
      0,
      0,
      0
    );
    const startTimestamp = startOfDay.getTime();
    const nextOfDay = date_scheduler(startOfDay, 1, true);
    const nextTimestamp = nextOfDay.getTime();
    return { startTimestamp, nextTimestamp, startOfDay, nextOfDay };
  };
  todayMemoryContextPage = async ({
    deckId,
    startTimestamp,
    userNewCardlimit,
    deckTodayLearnedcount,
    page,
    ignoreCardIds,
  }: SearchTodayMemoryContextPage): Promise<NoteMemoryContext> => {
    if ((page ?? 0) < 1) {
      throw new Error('page must be greater than 0');
    }
    const noteContext: NoteMemoryContext = Object.create(null);
    await Promise.all(
      states_prisma.map(async (state) => {
        noteContext[state] = await getNoteMemoryContextAction(
          deckId,
          state,
          startTimestamp,
          userNewCardlimit,
          deckTodayLearnedcount,
          memoryPageSize,
          page,
          ignoreCardIds
        );
      })
    );
    return noteContext;
  };
}
