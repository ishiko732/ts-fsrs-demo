"use client";
import { StateBox } from "@lib/reviews/card/fsrsToPrisma/handler";
import { Card, Note } from "@prisma/client";
import { useMemo, useState } from "react";
import { State } from "ts-fsrs";

export type CardBoxes = {
  currentType: StateBox;
  setCurrentType: React.Dispatch<React.SetStateAction<StateBox>>;
  noteBox: { [key in StateBox]: Array<Note & { cards: Card[] }> };
  setNoteBox: {
    [key in StateBox]: React.Dispatch<
      React.SetStateAction<Array<Note & { cards: Card[] }>>
    >;
  };
};

export function useCardBoxes(noteBox0: Array<Array<Note & { cards: Card[] }>>) {
  const [NewCard, LearningCard, RelearningCard, ReviewCard] = noteBox0;
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
