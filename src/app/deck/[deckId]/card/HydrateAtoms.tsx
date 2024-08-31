'use client';
import { ReviewBarAtom, ReviewSvc } from '@/atom/decks/review';
import { useExtraService } from '@hooks/reviews/useExtraHelper';
import { useListeners } from '@hooks/reviews/useListeners';
import { DeckMemoryContext } from '@lib/reviews/type';
import { Card, Note } from '@prisma/client';
import { useHydrateAtoms } from 'jotai/utils';
import { FSRSParameters } from 'ts-fsrs';

type HydrateAtomsProps = {
  deckContext: DeckMemoryContext;
  fsrsParams: FSRSParameters;
  children: React.ReactNode;
  cards: Card[];
  notes: Note[];
};

export function HydrateAtoms({
  deckContext,
  fsrsParams,
  children,
  cards,
  notes,
}: HydrateAtomsProps) {
  // Init Core
  const { noteContext, ...deckMemory } = deckContext;
  const { memoryState, ...page } = noteContext;
  // Svc
  const deckSvc = ReviewSvc.deck;
  const noteSvc = ReviewSvc.note;
  const cardSvc = ReviewSvc.card;
  deckSvc.init(deckMemory.deckId);
  cardSvc.init(deckMemory.deckId, deckContext.lapsers, fsrsParams);

  useListeners();
  deckSvc.hydrate(deckContext);
  noteSvc.importMemory(noteContext.memoryState);
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

  useExtraService();
  return <>{children}</>;
}
