"use client";
import { Card, Note } from "@prisma/client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { Grade, RecordLog, State, fixDate } from "ts-fsrs";
import { StateBox } from "@/vendor/fsrsToPrisma/handler";
import { useCardBoxes } from "@/hooks/useCardBoxes";
import { useRollback } from "@/hooks/useRollback";
import { DSR, useSchedule } from "@/hooks/useSchdule";

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
  noteBox: { [key in StateBox]: Array<Note & { card: Card }> };
  setNoteBox: {
    [key in StateBox]: React.Dispatch<
      React.SetStateAction<Array<Note & { card: Card }>>
    >;
  };
  handleSchdule: (grade: Grade) => Promise<boolean>;
  handleRollBack: () => Promise<(Note & { card: Card }) | undefined>;
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
  noteBox0: Array<Array<Note & { card: Card }>>;
}) {
  const { currentType, setCurrentType, noteBox, setNoteBox } =
    useCardBoxes(noteBox0);
  const [open, setOpen] = useState(false);

  const { rollBackRef, rollbackAble, setRollbackAble, handleRollBack } =
    useRollback({
      currentType,
      setCurrentType,
      noteBox,
      setNoteBox,
      open,
      setOpen,
    });

  const { schedule, setSchedule, handleSchdule, DSR, setDSR } = useSchedule({
    noteBox,
    currentType,
    setCurrentType,
    setNoteBox,
    rollBackRef,
    rollbackAble,
    setRollbackAble,
    open,
    setOpen,
    handleRollBack,
  });

  const value = {
    open,
    setOpen,
    currentType,
    setCurrentType,
    schedule,
    setSchedule,
    noteBox: noteBox,
    setNoteBox: setNoteBox,
    handleSchdule,
    handleRollBack,
    rollbackAble,
    DSR,
    setDSR,
  };
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}
