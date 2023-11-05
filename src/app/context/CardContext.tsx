"use client";
import { Card, Note } from "@prisma/client";
import { createContext, ReactNode, useContext, useState } from "react";
import { RecordLog } from "ts-fsrs/dist/models";

type CardContextProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentType: number;
  setCurrentType: React.Dispatch<React.SetStateAction<number>>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  noteBox: Array<Array<Note & { card: Card }>>;
  schedule:RecordLog|undefined;
  setSchedule:React.Dispatch<React.SetStateAction<RecordLog|undefined>>
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
  noteBox,
}: {
  children: ReactNode;
  noteBox: Array<Array<Note & { card: Card }>>;
}) {
  const [NewCard, LearningCard, RelearningCard, ReviewCard] = noteBox;
  const [currentType, setCurrentType] = useState(0);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [schedule,setSchedule] = useState<RecordLog|undefined>(undefined)
  const value = {
    open,
    setOpen,
    currentType,
    setCurrentType,
    index,
    setIndex,
    noteBox,
    schedule,
    setSchedule
  };
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}
