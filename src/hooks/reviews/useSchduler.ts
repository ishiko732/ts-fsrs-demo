import {  ReviewSvc } from '@/atom/decks/review';
import { debounce } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { Grade } from 'ts-fsrs';

export const useScheduler = () => {
  const cardSvc = useAtomValue(ReviewSvc.card);
  const handlerSchduler = useCallback(
    async (cardId:number,grade: Grade) => {
      const now = new Date();
      cardSvc.schduler(cardId, now, grade);
    },
    [cardSvc]
  );

  return debounce(handlerSchduler);
};
