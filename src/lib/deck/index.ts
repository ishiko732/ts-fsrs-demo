import { fsrs, FSRSParameters } from 'ts-fsrs';
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
} from '@actions/userDeckService';
import { computedToday } from './crud';
import { states_prisma } from '@/constant';
import { deckCrud } from '@lib/container';
const memoryPageSize = 50;

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

  getAlgorithm = async () => {
    const params = await this.getAlgorithmParams();
    return fsrs(params);
  };

  getTodayMemoryContext = async (
    timezone: string,
    hourOffset: number
  ): Promise<DeckMemoryContext> => {
    const { startTimestamp, nextTimestamp, startOfDay, nextOfDay } =
      computedToday(timezone, hourOffset);

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
      deckName: deck.name,
      timezone,
      startTimestamp,
      nextTimestamp,
      userNewCardlimit: deck.card_limit,
      deckTodayLearnedcount: count,
      noteContext: noteContext,
    } satisfies DeckMemoryContext;
  };

  todayMemoryContextPage = async ({
    deckId,
    startTimestamp,
    nextTimestamp,
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
          nextTimestamp,
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
