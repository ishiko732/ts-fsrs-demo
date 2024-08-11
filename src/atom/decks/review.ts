import { atom } from 'jotai';
import { State as PrismaState } from '@prisma/client';
import { generatorParameters } from 'ts-fsrs';
import { DeckService } from '@lib/reviews/deck';
import { NoteService } from '@lib/reviews/note';
import { DeckMemoryInit, DEFAULT_DECK_ID } from '@/constant';
import { CardService } from '@lib/reviews/card';
import { NoteMemoryState } from '@lib/reviews/type';

export const ReviewBarAtom = {
  [PrismaState.New]: atom(0),
  [PrismaState.Learning]: atom(0),
  [PrismaState.Relearning]: atom(0),
  [PrismaState.Review]: atom(0),
};

export const CurrentStateAtom = atom(PrismaState.New as PrismaState);

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
  card: atom(new CardService(DEFAULT_DECK_ID)),
};
