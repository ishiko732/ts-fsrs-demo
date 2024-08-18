import {
  ReviewSvc,
  ReviewBarAtom,
  CurrentStateAtom,
  Boxes,
  CurrentPreviewAtom,
} from '@/atom/decks/review';
import { StateBox } from '@/constant';
import { useAtomValue, useSetAtom } from 'jotai';
import { use, useRef } from 'react';
import { Card as PrismaCard, Note, State as PrismaState } from '@prisma/client';
import { RecordLog } from 'ts-fsrs';

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
    cardSvc.on(
      'full block',
      (hydrate_boxes: Record<StateBox, PrismaCard[]>) => {
        boxes_new((pre) => {
          const data = new Set([...pre, ...hydrate_boxes[PrismaState.New]]);
          return Array.from(data);
        });
        boxes_learning((pre) => {
          const data = new Set([
            ...pre,
            ...hydrate_boxes[PrismaState.Learning],
          ]);
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
      }
    );
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
  // 2.update PreviewButton
  const setCurrentType = useSetAtom(CurrentStateAtom);
  const setCurrentPreview = useSetAtom(CurrentPreviewAtom);
  if (!loadedRef.current) {
    cardSvc.on('current', async (type: PrismaState, cid: number) => {
      setCurrentType(
        type === PrismaState.Relearning ? PrismaState.Learning : type
      );
      console.log('on current type');
      const now = new Date();
      const record = await cardSvc.preview(cid, now);
      setCurrentPreview(record);
      console.log('on current card', record);
    });
  }

  // 3. update Schduler
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
            nextState === PrismaState.Relearning) ||
          (currentState === PrismaState.Review &&
            nextState === PrismaState.Review);

        if (currentState === PrismaState.New || !keep) {
          currentBarAtom((pre) => pre - 1);
        }
        if (
          (nextState === PrismaState.Learning ||
            nextState === PrismaState.Relearning) &&
          !keep
        ) {
          nextBarAtom((pre) => pre + 1);
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
