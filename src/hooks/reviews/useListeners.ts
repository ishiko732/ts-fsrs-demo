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
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { use, useCallback, useEffect, useRef } from 'react';
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

export function useListeners(page: number) {
  // init event emitter [boxes]
  const deckSvc = useAtomValue(ReviewSvc.deck);
  const noteSvc = useAtomValue(ReviewSvc.note);
  const cardSvc = useAtomValue(ReviewSvc.card);
  const boxes_new = useSetAtom(Boxes.New);
  const boxes_learning = useSetAtom(Boxes.Learning);
  const boxes_review = useSetAtom(Boxes.Review);
  const loadedRef = useRef({
    'full block': false,
    current: false,
    'scheduler-note': false,
    'scheduler-card': false,
    finish: false,
    rollback: false,
    edit: false,
  });
  const pageRef = useRef<number[]>([page]);
  const handlerCardSvcFullBlock = useCallback(
    (hydrate_boxes: Record<StateBox, PrismaCard[]>) => {
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
      console.log('on full block');
    },
    [boxes_new, boxes_learning, boxes_review]
  );

  useEffect(() => {
    if (!loadedRef.current['full block']) {
      console.log('[EventEmitter] cardSvc load full block ');
      cardSvc.on('full block', handlerCardSvcFullBlock);
      loadedRef.current['full block'] = true;
    }

    return () => {
      if (loadedRef.current) {
        console.log('[EventEmitter] cardSvc remove full block ');
        cardSvc.removeListener('full block', handlerCardSvcFullBlock);
        loadedRef.current['full block'] = false;
      }
    };
  }, []);
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
  useEffect(() => {
    if (!loadedRef.current['current']) {
      console.log('[EventEmitter] cardSvc load current ');
      cardSvc.on('current', handlerCardSvcCurrent);
      loadedRef.current['current'] = true;
    }
    return () => {
      if (loadedRef.current['current']) {
        console.log('[EventEmitter] cardSvc remove current ');
        cardSvc.removeListener('current', handlerCardSvcCurrent);
        loadedRef.current['current'] = false;
      }
    };
  }, []);

  // 3. update Scheduler
  const handlerCardSvcScheduler = useCallback(
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
    },
    [setBarAtom, noteSvc]
  );
  useEffect(() => {
    if (!loadedRef.current['scheduler-card']) {
      console.log('[EventEmitter] cardSvc load scheduler ');
      cardSvc.on('scheduler', handlerCardSvcScheduler);
      loadedRef.current['scheduler-card'] = true;
    }
    return () => {
      if (loadedRef.current['scheduler-card']) {
        console.log('[EventEmitter] cardSvc remove scheduler ');
        cardSvc.removeListener('scheduler', handlerCardSvcScheduler);
        loadedRef.current['scheduler-card'] = false;
      }
    };
  }, []);

  // 4. update current note and card
  const setNoteId = useSetAtom(currentNoteId);
  const setNote = useSetAtom(currentNote);
  const setCardId = useSetAtom(currentCardId);
  const setCard = useSetAtom(currentCard);
  const setOpen = useSetAtom(DisplayAnswer);
  const handlerNoteSvcScheduler = useCallback(
    async (prev?: TEmitNoteScheduler) => {
      const next = noteSvc.scheduler(prev?.nid, prev?.cid, prev?.orderId);
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
        cardSvc.emit('finish', prev);
        if (typeof window !== 'undefined' && 'container' in window) {
          // debug
          Reflect.set(window.container!, 'finish', {
            status: true,
            last: prev,
          });
        }
      }
      setOpen(false);
    },
    [noteSvc, cardSvc, setCardId, setCard, setNoteId, setNote, setOpen]
  );

  useEffect(() => {
    if (!loadedRef.current['scheduler-note']) {
      console.log('[EventEmitter] noteSvc load scheduler ');
      noteSvc.on('scheduler', handlerNoteSvcScheduler);
    }
    return () => {
      if (loadedRef.current['scheduler-note']) {
        console.log('[EventEmitter] noteSvc remove scheduler ');
        noteSvc.removeListener('scheduler', handlerNoteSvcScheduler);
        loadedRef.current['scheduler-note'] = false;
      }
    };
  }, []);

  // 5. update finish
  const setFinish = useSetAtom(DisplayFinish);
  const handlerCardSvcFinish = useCallback(
    async (prev?: TEmitNoteScheduler) => {
      setFinish(true);
    },
    []
  );
  useEffect(() => {
    if (!loadedRef.current['finish']) {
      console.log('[EventEmitter] cardSvc load finish ');
      cardSvc.on('finish', handlerCardSvcFinish);
      loadedRef.current['finish'] = true;
    }
    return () => {
      if (loadedRef.current['finish']) {
        console.log('[EventEmitter] cardSvc remove finish ');
        cardSvc.removeListener('finish', handlerCardSvcFinish);
        loadedRef.current['finish'] = false;
      }
    };
  }, []);

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
      const nextBarAtom = setBarAtom[data.nextState];
      nextBarAtom((pre) => pre + 1);
      setOpen(false);
    },
    [
      noteSvc,
      cardSvc,
      setNoteId,
      setNote,
      setCardId,
      setCard,
      setBarAtom,
      setOpen,
    ]
  );
  useEffect(() => {
    if (!loadedRef.current['rollback']) {
      console.log('[EventEmitter] cardSvc load rollback ');
      cardSvc.on('rollback', handlerCardSvcRollback);
      loadedRef.current['rollback'] = true;
    }
    return () => {
      if (loadedRef.current['rollback']) {
        console.log('[EventEmitter] cardSvc remove rollback ');
        cardSvc.removeListener('rollback', handlerCardSvcRollback);
        loadedRef.current['rollback'] = false;
      }
    };
  }, []);

  const handlerNoteSvcEdit = useCallback(
    async (note: PrismaNote) => {
      setNoteId(note.nid);
      setNote(note);
    },
    [setNoteId, setNote]
  );
  // extra edit note
  useEffect(() => {
    if (!loadedRef.current['edit']) {
      console.log('[EventEmitter] noteSvc load edit ');
      noteSvc.on('edit', handlerNoteSvcEdit);
      loadedRef.current['edit'] = true
    }
    return () => {
      if (loadedRef.current['edit']) {
        console.log('[EventEmitter] noteSvc remove edit ');
        noteSvc.removeListener('edit', handlerNoteSvcEdit);
        loadedRef.current['edit'] = false;
      }
    };
  }, []);

  if (typeof window !== 'undefined') {
    // debug
    Reflect.set(window, 'container', {});
    if ('container' in window) {
      Reflect.set(window.container!, 'svc', { deckSvc, noteSvc, cardSvc });
    }
  }
}
