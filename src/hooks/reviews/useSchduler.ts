import { ReviewSvc } from '@/atom/decks/review';
import { debounce } from '@/lib/utils';
import { useCallback } from 'react';
import { Grade } from 'ts-fsrs';

export const useScheduler = () => {
  const { card: cardSvc } = ReviewSvc;
  const handlerScheduler = useCallback(
    async (cardId: number, grade: Grade) => {
      const now = new Date();
      cardSvc.scheduler(cardId, now, grade);
    },
    [cardSvc]
  );

  return debounce(handlerScheduler);
};
