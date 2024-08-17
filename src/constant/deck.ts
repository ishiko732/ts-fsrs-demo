import type { DeckMemoryState } from '@lib/reviews/type';

export const CARDLIMT = 50;
export const LAPSES = 8;
export const DEFAULT_DECK_ID = 0;
export const memoryPageSize = 50;

export const DeckMemoryInit: DeckMemoryState = {
  uid: 0,
  deckId: DEFAULT_DECK_ID,
  deckName: 'Init',
  timezone: 'UTC',
  hoursOffset: 4,
  startTimestamp: 0,
  nextTimestamp: 0 + 86400,
  userNewCardlimit: 0,
  deckTodayLearnedcount: 0,
  lapsers: LAPSES,
};
