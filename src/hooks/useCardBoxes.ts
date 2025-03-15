"use client";

import type { TCardDetail } from "@server/services/decks/cards";
import { useMemo, useState } from "react";
import { State } from "ts-fsrs";

import { type StateBox } from "@/vendor/fsrsToPrisma/handler";

export type CardBoxes = {
  currentType: StateBox;
  setCurrentType: React.Dispatch<React.SetStateAction<StateBox>>;
  noteBox: { [key in StateBox]: Array<TCardDetail > };
  setNoteBox: {
    [key in StateBox]: React.Dispatch<
      React.SetStateAction<Array<TCardDetail >>
    >;
  };
};

export function useCardBoxes(noteBox0: Map<State, Array<TCardDetail>>) {
  const [NewCard, LearningCard, RelearningCard, ReviewCard] = noteBox0.values();
  const [NewCardBox, setNewCardBox] = useState(NewCard);
  const [LearningCardBox, setLearningCardBox] = useState(() => {
    const l = [];
    if (LearningCard) {
      l.push(...LearningCard);
    }
    if (RelearningCard) {
      l.push(...RelearningCard);
    }
    return l;
  });
  const [ReviewCardBox, setReviewCardBox] = useState(ReviewCard);

  const noteBox = useMemo(
    () => ({
      [State.New]: NewCardBox,
      [State.Learning]: LearningCardBox,
      [State.Review]: ReviewCardBox,
    }),
    [NewCardBox, LearningCardBox, ReviewCardBox]
  );
  const setNoteBox = useMemo(
    () => ({
      [State.New]: setNewCardBox,
      [State.Learning]: setLearningCardBox,
      [State.Review]: setReviewCardBox,
    }),
    [setNewCardBox, setLearningCardBox, setReviewCardBox]
  );
  const [currentType, setCurrentType] = useState<StateBox>(() => {
    let current: StateBox = State.New;
    for (let i = 0; i < 3; i++) {
      if (noteBox[current].length > 0) {
        break;
      }
      current = ((current + 1) % 3) as StateBox;
    }
    return current;
  });

  const value: CardBoxes = {
    currentType,
    setCurrentType,
    noteBox,
    setNoteBox,
  };
  return value;
}
