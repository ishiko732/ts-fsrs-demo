import {
  currentNoteId,
  currentNote,
  currentCardId,
  currentCard,
  DisplayAnswer,
  ReviewSvc,
} from '@/atom/decks/review';
import type { TEmitNoteScheduler } from '@lib/reviews/type';
import { useStore } from 'jotai';
import { Card as PrismaCard, Note as PrismaNote } from '@prisma/client';
import { useEffect } from 'react';
import { toastEmitter } from '@hooks/useToastListeners';

export const useNoteService = () => {
  const { deck: deckSvc, note: noteSvc, card: cardSvc } = ReviewSvc;
  const store = useStore();
  // update current note and card
  const handlerNoteSvcScheduler = async (prev?: TEmitNoteScheduler) => {
    const next = noteSvc.scheduler(prev?.nid, prev?.cid, prev?.orderId);
    const { nid, cid, orderId } = next.data;
    let card: PrismaCard | null = null;
    if (!cid) {
      console.log('create card', nid, orderId);
      card = await cardSvc.create(nid, orderId);
      next.update(card.cid);
    } else {
      card = await cardSvc.getCard(cid);
      console.log('load card', cid, card);
    }
    store.set(currentCardId, card.cid);
    store.set(currentCard, card);
    store.set(currentNoteId, nid);
    if (nid) {
      const note = await noteSvc.getNote(nid);
      store.set(currentNote, note);
      console.log('load note', nid, note);
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
    store.set(DisplayAnswer, false);
  };

  const handlerNoteSvcEdit = async (note: PrismaNote | null, error?: Error) => {
    toastEmitter.emitToast({
      title: 'Note Service - success',
      description: error ? error.message : 'Note updated successfully',
      variant: error ? 'destructive' : 'default',
    });
    if (note) {
      store.set(currentNoteId, note.nid);
      store.set(currentNote, note);
    }
  };

  useEffect(() => {
    console.log('[Note-EventEmitter] load scheduler ');
    noteSvc.on('scheduler', handlerNoteSvcScheduler);

    console.log('[Note-EventEmitter] load edit');
    noteSvc.on('edit', handlerNoteSvcEdit);

    return () => {
      noteSvc.off('scheduler', handlerNoteSvcScheduler);
      console.log('[Note-EventEmitter] remove scheduler');

      noteSvc.off('edit', handlerNoteSvcEdit);
      console.log('[Note-EventEmitter] remove edit');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);
};
