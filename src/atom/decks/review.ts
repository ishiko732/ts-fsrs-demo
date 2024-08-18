'use client';
import { Atom, atom, PrimitiveAtom, useAtomValue, useSetAtom } from 'jotai';
import { Card as PrismaCard, Note, State as PrismaState } from '@prisma/client';
import { generatorParameters } from 'ts-fsrs';
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
import { useRef } from 'react';
import { cardCrud, noteCrud } from '@lib/container';

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

export const Boxes = {
  [PrismaState.New]: atom([] as PrismaCard[]),
  [PrismaState.Learning]: atom([] as PrismaCard[]),
  [PrismaState.Review]: atom([] as PrismaCard[]),
} as Record<StateBox, PrimitiveAtom<PrismaCard[]>>;

export function useListeners(page: number) {
  // init event emitter [boxes]
  const deckSvc = useAtomValue(ReviewSvc.deck);
  const noteSvc = useAtomValue(ReviewSvc.note);
  const cardSvc = useAtomValue(ReviewSvc.card);
  const boxes_new = useSetAtom(Boxes.New);
  const boxes_learning = useSetAtom(Boxes.Learning);
  const boxes_review = useSetAtom(Boxes.Review);
  const loadedRef = useRef(false);
  const pageRef = useRef<number[]>([page]);
  if (!loadedRef.current) {
    cardSvc.on('full block', (hydrate_boxes: Record<StateBox, PrismaCard[]>) => {
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

      // setTimeout(() => {
      //   new Promise(async () => {
      //     const page = deckSvc.page + 1;
      //     if (pageRef.current.includes(page)) return;
      //     pageRef.current.push(page);
      //     const nextContext = await deckSvc.todayMemoryContextPage(
      //       page,
      //       cardSvc.getLoadedCardIds()
      //     );
      //     if (!nextContext.memoryState.length) {
      //       cardSvc.removeAllListeners('full block');
      //       return;
      //     }
      //     const noteIds = nextContext.memoryState.map((note) => note.noteId);
      //     const cardIds = nextContext.memoryState
      //       .map((note) => note.cardId)
      //       .filter((cardId) => cardId !== CARD_NULL);
      //     const [notes, cards] = await Promise.all([
      //       noteCrud.gets(noteIds),
      //       cardCrud.gets(cardIds),
      //     ]);
      //     noteSvc.hydrate(notes);
      //     cardSvc.hydrate(cards);
      //     console.log('new load', nextContext.loadPage);
      //     console.log(nextContext);
      //     debugger;
      //   });
      // }, 50);
      console.log('on full block');
    });
  }
  // init event emitter [CurrentStateAtom]
  // scheduler
  const setBarAtom = {
    [PrismaState.New]: useSetAtom(ReviewBarAtom.New),
    [PrismaState.Learning]: useSetAtom(ReviewBarAtom.Learning),
    [PrismaState.Relearning]: useSetAtom(ReviewBarAtom.Relearning),
    [PrismaState.Review]: useSetAtom(ReviewBarAtom.Review),
  };
  // 1.update ReviewBarAtom
  const currentType = useSetAtom(CurrentStateAtom);
  if (!loadedRef.current) {
    cardSvc.on('current type', async (type: PrismaState) => {
      currentType(
        type === PrismaState.Relearning ? PrismaState.Learning : type
      );
      console.log('on current type');
    });
  }
  if (!loadedRef.current) {
    cardSvc.on(
      'scheduler',
      ({
        nextState,
        currentState,
      }: {
        nextState: PrismaState;
        currentState: PrismaState;
      }) => {
        const currentBarAtom = setBarAtom[currentState];
        const nextBarAtom = setBarAtom[nextState];
        const keep =
          (currentState === PrismaState.Learning &&
            nextState === PrismaState.Learning) ||
          (currentState === PrismaState.Relearning &&
            nextState === PrismaState.Relearning);

        if (nextState === PrismaState.Review) {
          nextBarAtom((pre) => pre - 1);
        }
        if (currentState === PrismaState.New || !keep) {
          currentBarAtom((pre) => pre - 1);
        }
        console.log('on scheduler');
      }
    );
  }

  if (typeof window !== 'undefined') {
    // debug
    Reflect.set(window, 'svc', { deckSvc, noteSvc, cardSvc });
  }
  loadedRef.current = true;
}
