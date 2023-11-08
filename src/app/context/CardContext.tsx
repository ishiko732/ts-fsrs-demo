"use client";
import { Card, Note } from "@prisma/client";
import { createContext, ReactNode, useContext, useState } from "react";
import { RecordLog, State } from "ts-fsrs/dist/models";

type CardContextProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentType: State;
  setCurrentType: React.Dispatch<React.SetStateAction<State>>;
  schedule:RecordLog|undefined;
  setSchedule:React.Dispatch<React.SetStateAction<RecordLog|undefined>>;
  noteBox:{[key in State]:Array<Note & { card: Card }>};
  setNoteBox:{[key in State]:React.Dispatch<React.SetStateAction<Array<Note & { card: Card }>>>};
};

const CardContext = createContext<CardContextProps | undefined>(undefined);

export function useCardContext() {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error("CardContext must be used within CardContextProps");
  }
  return context;
}

export function CardProvider({
  children,
  noteBox
}: {
  children: ReactNode;
  noteBox: Array<Array<Note & { card: Card }>>;
}) {
  const [NewCard, LearningCard, RelearningCard, ReviewCard] = noteBox;
  const [NewCardBox,setNewCardBox] = useState(NewCard)
  const [LearningCardBox,setLearningCardBox] = useState(LearningCard)
  const [RelearningCardBox,setRelearningCardBox] = useState(RelearningCard)
  const [ReviewCardBox,setReviewCardBox] = useState(ReviewCard)
  const [currentType, setCurrentType] = useState<State>(State.New);
  const [open, setOpen] = useState(false);
  const [schedule,setSchedule] = useState<RecordLog|undefined>(undefined)
  const value = {
    open,
    setOpen,
    currentType,
    setCurrentType,
    schedule,
    setSchedule,
    noteBox:{
      [State.New]:NewCardBox,
      [State.Learning]:LearningCardBox,
      [State.Relearning]:RelearningCardBox,
      [State.Review]:ReviewCardBox
    },
    setNoteBox:{
      [State.New]:setNewCardBox,
      [State.Learning]:setLearningCardBox,
      [State.Relearning]:setRelearningCardBox,
      [State.Review]:setReviewCardBox
    }
  };
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}
