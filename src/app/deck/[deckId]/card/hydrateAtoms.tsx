'use client';
import {
  Boxes,
  CurrentStateAtom,
  ReviewBarAtom,
  ReviewCore,
  ReviewSvc,
} from '@/atom/decks/review';
import { StateBox, states_prisma } from '@/constant';
import { CardService } from '@lib/reviews/card';
import { DeckService } from '@lib/reviews/deck';
import { NoteService } from '@lib/reviews/note';
import { DeckMemoryContext } from '@lib/reviews/type';
import { Card, Note, State } from '@prisma/client';
import { useAtomValue, useSetAtom } from 'jotai';
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
    [
      ReviewSvc.card,
      new CardService(deckMemory.deckId, deckContext.lapsers, fsrsParams),
    ],
  ]);

  const noteSvc = useAtomValue(ReviewSvc.note);
  const cardSvc = useAtomValue(ReviewSvc.card);

  // init event emitter [boxes]
  const boxes_new = useSetAtom(Boxes.New);
  const boxes_learning = useSetAtom(Boxes.Learning);
  const boxes_review = useSetAtom(Boxes.Review);
  cardSvc.on('full block', (hydrate_boxes: Record<StateBox, Card[]>) => {
    boxes_new((pre) => {
      const data = new Set([...pre, ...hydrate_boxes[State.New]]);
      return Array.from(data);
    });
    boxes_learning((pre) => {
      const data = new Set([...pre, ...hydrate_boxes[State.Learning]]);
      return Array.from(data);
    });
    boxes_review((pre) => {
      const data = new Set([...pre, ...hydrate_boxes[State.Review]]);
      return Array.from(data);
    });
  });

  // init event emitter [CurrentStateAtom]
  const currentType = useSetAtom(CurrentStateAtom);
  cardSvc.on('current type', async(type: State) => {
    currentType(type === State.Relearning ? State.Learning : type);
  });

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
