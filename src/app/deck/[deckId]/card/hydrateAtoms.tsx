'use client';
import { ReviewBarAtom, ReviewCore, ReviewSvc } from '@/atom/decks/review';
import { CardService } from '@lib/reviews/card';
import { DeckService } from '@lib/reviews/deck';
import { NoteService } from '@lib/reviews/note';
import { DeckMemoryContext } from '@lib/reviews/type';
import { Card, Note } from '@prisma/client';
import { useAtomValue } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { FSRSParameters } from 'ts-fsrs';

type HydrateAtomsProps = {
  deckContext: DeckMemoryContext;
  fsrsParams: FSRSParameters;
  children: React.ReactNode;
  cards: Card[];
  notes: Note[];
};

export const HydrateAtoms = ({
  deckContext,
  fsrsParams,
  children,
  cards,
  notes,
}: HydrateAtomsProps) => {
  // Init Core
  const { noteContext, ...deckMemory } = deckContext;
  const { memoryState, ...page } = noteContext;
  useHydrateAtoms([
    [ReviewCore.deckMemory, deckMemory],
    [ReviewCore.fsrsParams, fsrsParams],
    [ReviewCore.noteMemory, memoryState],
    [ReviewCore.notePage.currentPage, page.pageSize],
  ]);
  // Svc
  useHydrateAtoms([
    [ReviewSvc.deck, new DeckService(deckMemory.deckId)],
    [ReviewSvc.note, new NoteService()],
    [ReviewSvc.card, new CardService(deckMemory.deckId, fsrsParams)],
  ]);

  const noteSvc = useAtomValue(ReviewSvc.note);
  const cardSvc = useAtomValue(ReviewSvc.card);
  noteSvc.hydrate(notes);
  cardSvc.hydrate(cards);

  // total -- statusBar.tsx
  const total = page.totalSize;
  useHydrateAtoms([
    [ReviewBarAtom.New, total.New],
    [ReviewBarAtom.Learning, total.Learning],
    [ReviewBarAtom.Relearning, total.Relearning],
    [ReviewBarAtom.Review, total.Review],
  ]);

  return <>{children}</>;
};
