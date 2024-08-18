import {
  ReviewSvc,
  currentNoteId,
  currentCardId,
  currentNote,
  currentCard,
} from '@/atom/decks/review';
import { Card as PrismaCard } from '@prisma/client';
import { useAtomValue, useAtom } from 'jotai';
import { useEffect } from 'react';

export const useReviewsInit = () => {
  const noteSvc = useAtomValue(ReviewSvc.note);
  const cardSvc = useAtomValue(ReviewSvc.card);
  const [noteId, setNoteId] = useAtom(currentNoteId);
  const [cardId, setCardId] = useAtom(currentCardId);
  const [note, setNote] = useAtom(currentNote);
  const [card, setCard] = useAtom(currentCard);

  useEffect(() => {
    if (!noteId) {
      const review = noteSvc.review();
      const { nid, cid, orderId } = review.data;
      new Promise(async () => {
        let data: PrismaCard | null = null;
        if (!cid) {
          console.log('create card', nid, orderId);
          data = await cardSvc.create(nid, orderId);
          review.update(data.cid);
        } else {
          data = await cardSvc.getCard(cid);
        }
        setCardId(data.cid);
        setCard(data);
      });
      setNoteId(nid);
      return;
    } else {
      new Promise(async () => {
        const data = await noteSvc.getNote(noteId);
        setNoteId(data.nid);
        setNote(data);
      });
    }
  }, [
    cardId,
    cardSvc,
    noteId,
    noteSvc,
    setCard,
    setCardId,
    setNote,
    setNoteId,
  ]);

  return {
    note: note ?? null,
    card: card ?? null,
    noteId,
    cardId,
  };
};
