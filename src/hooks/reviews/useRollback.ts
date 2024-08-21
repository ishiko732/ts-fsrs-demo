import { ReviewSvc } from '@/atom/decks/review';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';

export const useRollback = () => {
  const cardSvc = useAtomValue(ReviewSvc.card);
  const handlerRollback = useCallback(async () => {
    cardSvc.rollback();
  }, [cardSvc]);

  return handlerRollback;
};
