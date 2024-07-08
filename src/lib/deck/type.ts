import { Card, Note, State as PrismaState } from '@prisma/client';
import { FSRS, FSRSParameters, RecordLog } from "ts-fsrs";

export type SearchTodayMemoryContextPage = {
  uid: number;
  startTimestamp: number;
  userNewCardlimit: number;
  deckTodayLearnedcount: number;
  page?: number;
  ignoreCardIds?: number[];
};

export abstract class IDeckService {
  abstract getDeck(deckId: number): void;
  abstract getAlgorithmParams(uid: number): Promise<FSRSParameters>;
  abstract getAlgorithm(uid: number): Promise<FSRS>;
  abstract getTodayMemoryContext(
    uid: number,
    timezone: string,
    hourOffset: number
  ): Promise<DeckMemoryContext>;
  abstract todayMemoryContextPage({
    uid,
    startTimestamp,
    userNewCardlimit,
    deckTodayLearnedcount,
    page,
    ignoreCardIds,
  }: SearchTodayMemoryContextPage): Promise<NoteMemoryContext>;
}

abstract class INoteService {
  abstract getNote(nid: number): Note;
  abstract getCard(nid: number): Card;
  abstract schduler(cid: number): void;
  abstract undo(): void;
  abstract rollback(): void;
  abstract edit(nid: number): Note;
  abstract previewRepeat(card: Card): RecordLog;
}

// deck
export interface DeckMemoryState {
  uid: number;
  timezone: string;
  startTimestamp: number;
  nextTimestamp: number;
  userNewCardlimit: number;
  deckTodayLearnedcount: number;
}

export interface DeckMemoryContext extends DeckMemoryState {
  noteContext: NoteMemoryContext;
}

export interface NoteMemoryState {
  deckId: number;
  noteId: number;
  cardId: number;
  due: number; // due timestamp
}

export interface NoteMemoryStatePage {
  memoryState: NoteMemoryState[];
  pageSize: number;
  loadPage: number;
  totalSize: number;
}

export type NoteMemoryContext = {
  [key in PrismaState]: NoteMemoryStatePage;
};

// TODO
enum NoteOrder {
  lastReview,
  Difficulty,
}
