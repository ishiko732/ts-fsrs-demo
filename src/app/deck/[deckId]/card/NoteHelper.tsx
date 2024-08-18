'use client';

import {
  currentCard,
  currentCardId,
  currentNote,
  currentNoteId,
  ReviewSvc,
} from '@/atom/decks/review';
import LoadingSpinner from '@/components/loadingSpinner';
import { useReviewsInit } from '@hooks/reviews/useInit';
import { Card as PrismaCard } from '@prisma/client';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

function NoteHelper() {
  const { card, note, noteId } = useReviewsInit();

  if (!noteId) {
    return <LoadingSpinner />;
  }

  return <div className=' container '>{JSON.stringify(note)}</div>;
}

export default NoteHelper;
