import {
  ReviewSvc,
  currentNoteId,
} from '@/atom/decks/review';
import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';

export const useReviewsInit = () => {
  const initdRef = useRef(false);
  const store = useStore();

  useEffect(() => {
    const noteId = store.get(currentNoteId);
    if (!noteId) {
      if (!initdRef.current) {
        initdRef.current = true;
        const emitStatus = ReviewSvc.note.emit('scheduler');
        console.log(`emitStatus: ${emitStatus}`);
      }
    }
  }, [store]);
};
