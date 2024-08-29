import {
  getDecksAction,
  getNoteMemoryTotalAction,
  getNoteTotalGroupAction,
  restoreDeckAction,
} from '@actions/userDeckService';
import {
  addNoteAction,
  addNotesAction,
  deleteNoteAction,
  getNoteAction,
  updateNoteAction,
} from '@actions/userNoteService';
import { Deck, Note } from '@prisma/client';
import { date_scheduler } from 'ts-fsrs';

// allow server/client use this class
export class NoteCrud {
  async getList(deleted?: boolean): Promise<Deck[]> {
    return await getDecksAction(deleted);
  }
  async get(nid: number) {
    const res = await getNoteAction(nid);
    if (!res) {
      throw new Error('Note not found');
    }
    return res;
  }

  async gets(nids: number[]) {
    const datum = await Promise.all(
      nids.map(async (nid) => getNoteAction(nid))
    );
    return datum.filter((note) => note !== null);
  }

  async create(
    deckId: number,
    note: Omit<Note, 'did' | 'uid' | 'deleted' | 'nid'>
  ) {
    return await addNoteAction(deckId, note);
  }

  async creates(
    deckId: number,
    notes: Omit<Note, 'did' | 'uid' | 'deleted' | 'nid'>[]
  ) {
    return await addNotesAction(deckId, notes);
  }

  async update(
    deckId: number,
    noteId: number,
    note: Partial<Omit<Note, 'did' | 'uid' | 'deleted'>>
  ) {
    return await updateNoteAction(deckId, noteId, note);
  }
  async delete(nid: number) {
    return await deleteNoteAction(nid);
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
