'use client';
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
  DisplayFinish,
  DisplayAnswer,
} from '@/atom/decks/review';
import { StateBox } from '@/constant';
import { useSetAtom, useStore } from 'jotai';
import { useCallback, useMemo, useRef } from 'react';
import {
  Card as PrismaCard,
  State as PrismaState,
  Note as PrismaNote,
} from '@prisma/client';
import {
  TEmitCardRollback,
  TEmitCardScheduler,
  TEmitNoteScheduler,
} from '@lib/reviews/type';

export function useCardService() {
  // init event emitter [boxes]
  const loadedRef = useRef(false);
  const store = useStore();
  const { deck: deckSvc, note: noteSvc, card: cardSvc } = ReviewSvc;
  const handlerCardSvcFullBlock = useCallback(
    (hydrate_boxes: Record<StateBox, PrismaCard[]>) => {
      [PrismaState.New, PrismaState.Learning, PrismaState.Review].forEach(
        (state) => {
          store.set(Boxes[state], (pre) => {
            const data = new Set([...pre, ...hydrate_boxes[state]]);
            return Array.from(data);
          });
        }
      );
    },
    [store]
  );

  // init event emitter [CurrentStateAtom]
  // scheduler
  // 1.update ReviewBarAtom
  // 2.update PreviewButton
  const setCurrentType = useSetAtom(CurrentStateAtom);
  const setCurrentPreview = useSetAtom(CurrentPreviewAtom);
  const handlerCardSvcCurrent = useCallback(
    async (type: PrismaState, cid: number) => {
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
    },
    [cardSvc, setCurrentType, setCurrentPreview]
  );

  // 3. update Scheduler
  const handlerCardSvcScheduler = ({
    nextState,
    currentState,
    nid,
    cid,
    orderId,
  }: TEmitCardScheduler) => {
    const keep =
      (currentState === PrismaState.Learning &&
        nextState === PrismaState.Learning) ||
      (currentState === PrismaState.Relearning &&
        nextState === PrismaState.Relearning) ||
      (currentState === PrismaState.Review && nextState === PrismaState.Review);

    let remove_rel = true;
    if (currentState === PrismaState.New || !keep) {
      store.set(ReviewBarAtom[currentState], (pre) => pre - 1);
    }
    if (
      (nextState === PrismaState.Learning ||
        nextState === PrismaState.Relearning) &&
      !keep
    ) {
      store.set(ReviewBarAtom[nextState], (pre) => pre + 1);
      remove_rel = false;
    }

    if (
      currentState === PrismaState.Review &&
      nextState === PrismaState.Review
    ) {
      store.set(ReviewBarAtom[currentState], (pre) => pre - 1);
    }
    const emitStatus = noteSvc.emit('scheduler', {
      nid,
      cid,
      orderId,
      remove: remove_rel,
    });
    console.log('emit status', emitStatus);
    console.log('on scheduler');
  };

  // 4. update current note and card
  const setNoteId = useSetAtom(currentNoteId);
  const setNote = useSetAtom(currentNote);
  const setCardId = useSetAtom(currentCardId);
  const setCard = useSetAtom(currentCard);
  const setOpen = useSetAtom(DisplayAnswer);

  // 5. update finish
  const setFinish = useSetAtom(DisplayFinish);
  const handlerCardSvcFinish = useCallback(
    async (prev?: TEmitNoteScheduler) => {
      setFinish(true);
    },
    [setFinish]
  );

  // extra rollback
  const handlerCardSvcRollback = useCallback(
    async (data: TEmitCardRollback) => {
      if (data.nid == 0 || data.cid == 0) {
        console.warn('rollback error', data);
        return;
      }
      noteSvc.rollback(data.nid, data.cid, data.orderId);
      setNoteId(data.nid);
      setNote(await noteSvc.getNote(data.nid));
      setCardId(data.cid);
      setCard(await cardSvc.getCard(data.cid));
      store.set(ReviewBarAtom[data.nextState], (pre) => pre + 1);
      setOpen(false);
    },
    [store, noteSvc, cardSvc, setNoteId, setNote, setCardId, setCard, setOpen]
  );

  if (!loadedRef.current) {
    ReviewSvc.deck.reset();
    ReviewSvc.note.reset();
    ReviewSvc.card.reset();
    loadedRef.current = true;
    console.log('[EventEmitter] cardSvc load full block ');
    cardSvc.on('full block', handlerCardSvcFullBlock);

    console.log('[EventEmitter] cardSvc load current ');
    cardSvc.on('current', handlerCardSvcCurrent);

    console.log('[EventEmitter] cardSvc load scheduler ');
    cardSvc.on('scheduler', handlerCardSvcScheduler);

    console.log('[EventEmitter] cardSvc load finish ');
    cardSvc.on('finish', handlerCardSvcFinish);

    console.log('[EventEmitter] cardSvc load rollback ');
    cardSvc.on('rollback', handlerCardSvcRollback);
  }

  if (typeof window !== 'undefined') {
    // debug
    Reflect.set(window, 'container', {});
    if ('container' in window) {
      Reflect.set(window.container!, 'svc', { deckSvc, noteSvc, cardSvc });
    }
  }
}
