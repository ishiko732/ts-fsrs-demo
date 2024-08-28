import { DEFAULT_DECK_ID } from '@/constant/deck';
import {
  addDeckAction,
  deleteDeckAction,
  getDecksAction,
  getNoteMemoryTotalAction,
  getNoteTotalGroupAction,
  getParamsByUserIdAction,
  restoreDeckAction,
  updateDeckAction,
} from '@actions/userDeckService';
import { Deck } from '@prisma/client';
import { date_scheduler } from 'ts-fsrs';

// allow server/client use this class
export class DeckCrud {
  async getList(deleted?: boolean): Promise<Deck[]> {
    return await getDecksAction(deleted);
  }
  async get(did: number) {
    const datum = await getParamsByUserIdAction(did);
    return datum[did] ? datum[did] : datum[DEFAULT_DECK_ID];
  }

  async create(deck: Omit<Deck, 'did' | 'uid' | 'deleted'>) {
    return await addDeckAction(deck);
  }

  async update(deck: Omit<Deck, 'uid' | 'deleted' | 'extends'>) {
    return await updateDeckAction(deck);
  }
  async delete(did: number, move: boolean) {
    // move: true => move to default deck
    // move: false => delete permanently(soft)
    return await deleteDeckAction(did, move);
  }

  async restore(did: number) {
    return await restoreDeckAction(did);
  }

  static async detail(
    did: number,
    timezone: string = 'UTC',
    hourOffset: number = 4
  ) {
    const { startTimestamp, nextTimestamp } = computedToday(
      timezone,
      hourOffset
    );
    return getNoteMemoryTotalAction(did, startTimestamp, nextTimestamp);
  }

  static async total(deckId?: number) {
    return await getNoteTotalGroupAction(deckId);
  }
}

export const computedToday = (timezone: string, hourOffset: number) => {
  const clientTime = Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'medium',
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
