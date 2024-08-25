'use client';
import { ReviewBarAtom, ReviewCore, ReviewSvc } from '@/atom/decks/review';
import { useExtraService } from '@hooks/reviews/useExtraHelper';
import { useListeners } from '@hooks/reviews/useListeners';
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
  const deckSvc = useAtomValue(ReviewSvc.deck);
  const noteSvc = useAtomValue(ReviewSvc.note);
  const cardSvc = useAtomValue(ReviewSvc.card);
  deckSvc.init(deckMemory.deckId);
  cardSvc.init(deckMemory.deckId, deckContext.lapsers, fsrsParams);

  useListeners(page.loadPage);
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
};
