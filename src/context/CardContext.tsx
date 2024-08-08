"use client";
import { Card, Note } from "@prisma/client";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { Grade, RecordLog, State } from "ts-fsrs";
import { StateBox } from "@lib/reviews/card/fsrsToPrisma/handler";
import { useCardBoxes } from "@/hooks/useCardBoxes";
import { useRollback } from "@/hooks/useRollback";
import { DSR, useSchedule } from "@/hooks/useSchdule";
import { useFinished } from "@/hooks/useFinished";

export type changeResponse = {
  code: number;
  nextState: State;
  nextDue?: Date;
  suspended: boolean;
};

type CardContextProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentType: StateBox;
  setCurrentType: React.Dispatch<React.SetStateAction<StateBox>>;
  schedule: RecordLog | undefined;
  setSchedule: React.Dispatch<React.SetStateAction<RecordLog | undefined>>;
  noteBox: { [key in StateBox]: Array<Note & { cards: Card[] }> };
  setNoteBox: {
    [key in StateBox]: React.Dispatch<
      React.SetStateAction<Array<Note & { cards: Card[] }>>
    >;
  };
  handleSchdule: (grade: Grade) => Promise<boolean>;
  handleRollBack: () => Promise<(Note & { cards: Card[] }) | undefined>;
  rollbackAble: boolean;
  DSR: DSR | undefined;
  setDSR: React.Dispatch<React.SetStateAction<DSR | undefined>>;
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
  noteBox0,
}: {
  children: ReactNode;
  noteBox0: Array<Array<Note & { cards: Card[] }>>;
}) {
  const [open, setOpen] = useState(false);
  const cardHooks = useCardBoxes(noteBox0);
  const rollbackHooks = useRollback({
    currentType: cardHooks.currentType,
    setCurrentType: cardHooks.setCurrentType,
    noteBox: cardHooks.noteBox,
    setNoteBox: cardHooks.setNoteBox,
    open,
    setOpen,
  });

  const scheduleHooks = useSchedule({
    currentType: cardHooks.currentType,
    setCurrentType: cardHooks.setCurrentType,
    noteBox: cardHooks.noteBox,
    setNoteBox: cardHooks.setNoteBox,
    rollBackRef: rollbackHooks.rollBackRef,
    rollbackAble: rollbackHooks.rollbackAble,
    setRollbackAble: rollbackHooks.setRollbackAble,
    handleRollBack: rollbackHooks.handleRollBack,
    open,
    setOpen,
  });

  useFinished(cardHooks);

  const value = {
    open,
    setOpen,
    noteBox: cardHooks.noteBox,
    setNoteBox: cardHooks.setNoteBox,
    currentType: cardHooks.currentType,
    setCurrentType: cardHooks.setCurrentType,
    handleRollBack: rollbackHooks.handleRollBack,
    rollbackAble: rollbackHooks.rollbackAble,
    schedule: scheduleHooks.schedule,
    setSchedule: scheduleHooks.setSchedule,
    handleSchdule: scheduleHooks.handleSchdule,
    DSR: scheduleHooks.DSR,
    setDSR: scheduleHooks.setDSR,
  };
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}
