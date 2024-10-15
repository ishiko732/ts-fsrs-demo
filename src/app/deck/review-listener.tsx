'use client';
import { useExtraService } from '@hooks/reviews/useExtraHelper';
import { useCardService } from '@hooks/reviews/useCardService';
import { useNoteService } from '@hooks/reviews/useNoteService';

export const ReviewListener = () => {
  useExtraService();
  useNoteService();
  useCardService();

  return null;
};
