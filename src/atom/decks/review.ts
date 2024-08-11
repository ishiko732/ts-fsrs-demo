import { Atom, atom, PrimitiveAtom, useAtomValue, useSetAtom } from 'jotai';
import { Card, State as PrismaState } from '@prisma/client';
import { generatorParameters } from 'ts-fsrs';
import { DeckService } from '@lib/reviews/deck';
import { NoteService } from '@lib/reviews/note';
import { DeckMemoryInit, DEFAULT_DECK_ID, LAPSES, StateBox } from '@/constant';
import { CardService } from '@lib/reviews/card';
import { NoteMemoryState } from '@lib/reviews/type';
import { useRef } from 'react';

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
  card: atom(new CardService(DEFAULT_DECK_ID, LAPSES)),
};

export const currentNoteId = atom(-1);
export const currentCardId = atom(-1);

export const Boxes = {
  [PrismaState.New]: atom([] as Card[]),
  [PrismaState.Learning]: atom([] as Card[]),
  [PrismaState.Review]: atom([] as Card[]),
} as Record<StateBox, PrimitiveAtom<Card[]>>;

export function useListeners() {
  // init event emitter [boxes]
  const noteSvc = useAtomValue(ReviewSvc.note);
  const cardSvc = useAtomValue(ReviewSvc.card);
  const boxes_new = useSetAtom(Boxes.New);
  const boxes_learning = useSetAtom(Boxes.Learning);
  const boxes_review = useSetAtom(Boxes.Review);
  const loadedRef = useRef(false);
  if (!loadedRef.current) {
    cardSvc.on('full block', (hydrate_boxes: Record<StateBox, Card[]>) => {
      boxes_new((pre) => {
        const data = new Set([...pre, ...hydrate_boxes[PrismaState.New]]);
        return Array.from(data);
      });
      boxes_learning((pre) => {
        const data = new Set([...pre, ...hydrate_boxes[PrismaState.Learning]]);
        return Array.from(data);
      });
      boxes_review((pre) => {
        const data = new Set([...pre, ...hydrate_boxes[PrismaState.Review]]);
        return Array.from(data);
      });
    });
    console.log('on full block');
  }
  // init event emitter [CurrentStateAtom]
  const currentType = useSetAtom(CurrentStateAtom);
  if (!loadedRef.current) {
    cardSvc.on('current type', async (type: PrismaState) => {
      currentType(
        type === PrismaState.Relearning ? PrismaState.Learning : type
      );
    });
    console.log('on current type');
  }
  loadedRef.current = true;
}
