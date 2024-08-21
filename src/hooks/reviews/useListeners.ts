import {
  ReviewSvc,
  ReviewBarAtom,
  CurrentStateAtom,
  Boxes,
  CurrentPreviewAtom,
  currentNote,
  currentCard,
  currentNoteId,
  currentCardId,
} from '@/atom/decks/review';
import { StateBox } from '@/constant';
import { useAtomValue, useSetAtom } from 'jotai';
import { useRef } from 'react';
import { Card as PrismaCard, State as PrismaState } from '@prisma/client';
import { TEmitCardScheduler, TEmitNoteScheduler } from '@lib/reviews/type';

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
      if (typeof window !== 'undefined' && 'container' in window) {
        // debug
        Reflect.set(window.container!, 'current', { type, record });
      }
    });
  }

  // 3. update Schduler
  if (!loadedRef.current) {
    cardSvc.on(
      'scheduler',
      ({ nextState, currentState, nid, cid, orderId }: TEmitCardScheduler) => {
        const currentBarAtom = setBarAtom[currentState];
        const nextBarAtom = setBarAtom[nextState];
        const keep =
          (currentState === PrismaState.Learning &&
            nextState === PrismaState.Learning) ||
          (currentState === PrismaState.Relearning &&
            nextState === PrismaState.Relearning) ||
          (currentState === PrismaState.Review &&
            nextState === PrismaState.Review);

        let remove_rel = true;
        if (currentState === PrismaState.New || !keep) {
          currentBarAtom((pre) => pre - 1);
        }
        if (
          (nextState === PrismaState.Learning ||
            nextState === PrismaState.Relearning) &&
          !keep
        ) {
          nextBarAtom((pre) => pre + 1);
          remove_rel = false;
        }

        if (
          currentState === PrismaState.Review &&
          nextState === PrismaState.Review
        ) {
          currentBarAtom((pre) => pre - 1);
        }
        noteSvc.emit('scheduler', { nid, cid, orderId, remove: remove_rel });
        console.log('on scheduler');
      }
    );
  }

  // 4. update current note and card
  const setNoteId = useSetAtom(currentNoteId);
  const setNote = useSetAtom(currentNote);
  const setCardId = useSetAtom(currentCardId);
  const setCard = useSetAtom(currentCard);
  if (!loadedRef.current) {
    noteSvc.on('scheduler', async (prev?: TEmitNoteScheduler) => {
      const next = noteSvc.schduler(prev?.nid, prev?.cid, prev?.orderId);
      const { nid, cid, orderId } = next.data;
      let card: PrismaCard | null = null;
      if (!cid) {
        console.log('create card', nid, orderId);
        card = await cardSvc.create(nid, orderId);
        next.update(card.cid);
      } else {
        card = await cardSvc.getCard(cid);
      }
      setCardId(card.cid);
      setCard(card);
      setNoteId(nid);
      if (nid) {
        const note = await noteSvc.getNote(nid);
        setNote(note);
        if (typeof window !== 'undefined' && 'container' in window) {
          // debug
          Reflect.set(window.container!, 'media', { note, card });
        }
      } else {
        if (typeof window !== 'undefined' && 'container' in window) {
          // debug
          Reflect.set(window.container!, 'finish', {
            status: true,
            last: prev,
          });
        }
      }
    });
  }

  if (typeof window !== 'undefined') {
    // debug
    Reflect.set(window, 'container', {});
    if ('container' in window) {
      Reflect.set(window.container!, 'svc', { deckSvc, noteSvc, cardSvc });
    }
  }
  loadedRef.current = true;
}
