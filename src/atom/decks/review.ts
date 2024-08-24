'use client';
import { atom, PrimitiveAtom } from 'jotai';
import { Card as PrismaCard, Note, State as PrismaState } from '@prisma/client';
import { generatorParameters, RecordLog } from 'ts-fsrs';
import { DeckService } from '@lib/reviews/deck';
import { NoteService } from '@lib/reviews/note';
import {
  CARD_NULL,
  DeckMemoryInit,
  DEFAULT_DECK_ID,
  LAPSES,
  StateBox,
} from '@/constant';
import { CardService } from '@lib/reviews/card';
import { NoteMemoryState } from '@lib/reviews/type';

export const ReviewBarAtom = {
  [PrismaState.New]: atom(0),
  [PrismaState.Learning]: atom(0),
  [PrismaState.Relearning]: atom(0),
  [PrismaState.Review]: atom(0),
};

// reviewInit
// src/app/deck/[deckId]/card/hydrateAtoms.tsx
export const ReviewCore = {
  deckMemory: atom(DeckMemoryInit),
  fsrsParams: atom(generatorParameters()),
  noteMemory: atom([] as NoteMemoryState[]),
  notePage: {
    pageSize: atom(0),
    currentPage: atom(1),
  },
};
export const ReviewSvc = {
  deck: atom(new DeckService(DEFAULT_DECK_ID)),
  note: atom(new NoteService()),
  card: atom(new CardService(DEFAULT_DECK_ID, LAPSES)),
};

export const currentNoteId = atom(0);
export const currentCardId = atom(0);
export const currentNote = atom<Note | null>();
export const currentCard = atom<PrismaCard | null>();

export const CurrentStateAtom = atom(PrismaState.New as PrismaState);
export const CurrentPreviewAtom = atom<RecordLog | null>();

export const Boxes = {
  [PrismaState.New]: atom([] as PrismaCard[]),
  [PrismaState.Learning]: atom([] as PrismaCard[]),
  [PrismaState.Review]: atom([] as PrismaCard[]),
} as Record<StateBox, PrimitiveAtom<PrismaCard[]>>;

// show
export const DisplayAnswer = atom(false);
export const DisplayDSR = atom(false);
export const DisplayFinish = atom(false);
export const DisplayNoteDialog = atom(false);
