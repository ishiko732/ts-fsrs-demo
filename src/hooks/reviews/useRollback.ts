import { ReviewSvc } from '@/atom/decks/review';
import { debounce } from '@/lib/utils';
import { useCallback } from 'react';

export const useRollback = () => {
  const { card: cardSvc } = ReviewSvc;
  const handlerRollback = useCallback(async () => {
    cardSvc.rollback();
  }, [cardSvc]);

  return debounce(handlerRollback);
};
