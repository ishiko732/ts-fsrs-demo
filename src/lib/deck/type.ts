import { Card, Deck, Note, State as PrismaState } from '@prisma/client';
import { FSRS, FSRSParameters, Grade, RecordLog } from 'ts-fsrs';

export type SearchTodayMemoryContextPage = {
  deckId: number;
  startTimestamp: number;
  nextTimestamp: number;
  userNewCardlimit: number;
  deckTodayLearnedcount: number;
  page?: number;
  ignoreCardIds?: number[];
};

export abstract class IDeckService {
  abstract getDeck(): Promise<Omit<Deck, 'deleted'>>;
  abstract getAlgorithmParams(): Promise<FSRSParameters>;
  abstract getTodayMemoryContext(
    timezone: string,
    hourOffset: number
  ): Promise<DeckMemoryContext>;
  abstract todayMemoryContextPage({
    startTimestamp,
    userNewCardlimit,
    deckTodayLearnedcount,
    page,
    ignoreCardIds,
  }: SearchTodayMemoryContextPage): Promise<NoteMemoryContext>;
}

export abstract class INoteService {
  abstract getNote(nid: number): Promise<Note>;
  abstract getCard(nid: number): Promise<Card>;
  abstract edit(
    nid: number,
    note: Partial<Omit<Note, 'did' | 'uid' | 'deleted'>>
  ): Promise<Note>;
  abstract preview(cid: number, now: Date): Promise<RecordLog>;
  abstract schduler(cid: number, now: Date, grade: Grade): Promise<boolean>;
  abstract undo(): Promise<boolean>;
  abstract rollback(): Promise<boolean>;
}

// deck
export interface DeckMemoryState {
  uid: number;
  deckId: number;
  deckName: string;
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

export interface NoteMomoryStateRequest {
  uid: number;
  deckId: number;
  state: PrismaState;
  lte: Date;
  limit: number;
  todayCount: number;
  pageSize: number;
  page?: number;
  ignoreCardIds?: number[];
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

export type PartialRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;
