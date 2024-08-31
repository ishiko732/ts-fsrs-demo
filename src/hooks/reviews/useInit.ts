import {
  ReviewSvc,
  currentNoteId,
  currentCardId,
  currentNote,
  currentCard,
} from '@/atom/decks/review';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

export const useReviewsInit = () => {
  const noteId = useAtomValue(currentNoteId);
  const cardId = useAtomValue(currentCardId);
  const note = useAtomValue(currentNote);
  const card = useAtomValue(currentCard);

  useEffect(() => {
    if (!noteId) {
      ReviewSvc.note.emit('scheduler');
    }
  }, [noteId]);

  return {
    note: note ?? null,
    card: card ?? null,
    noteId,
    cardId,
    noteSvc: ReviewSvc.note,
  };
};
