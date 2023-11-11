"use client";
import { Card, Note } from "@prisma/client";
import { createContext, ReactNode, useContext, useState } from "react";
import {  RecordLog, State } from "ts-fsrs";

type CardContextProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentType: State;
  setCurrentType: React.Dispatch<React.SetStateAction<State>>;
  schedule:RecordLog|undefined;
  setSchedule:React.Dispatch<React.SetStateAction<RecordLog|undefined>>;
  noteBox:{[key in State]:Array<Note & { card: Card }>};
  setNoteBox:{[key in State]:React.Dispatch<React.SetStateAction<Array<Note & { card: Card }>>>};
  handleChange:(nextState: State,note:Note & { card: Card })=>boolean;
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
  noteBox0
}: {
  children: ReactNode;
  noteBox0: Array<Array<Note & { card: Card }>>;
}) {
  const [NewCard, LearningCard, RelearningCard, ReviewCard] = noteBox0;
  const [NewCardBox,setNewCardBox] = useState(NewCard)
  const [LearningCardBox,setLearningCardBox] = useState(LearningCard)
  const [RelearningCardBox,setRelearningCardBox] = useState(RelearningCard)
  const [ReviewCardBox,setReviewCardBox] = useState(ReviewCard)
  const [currentType, setCurrentType] = useState<State>(State.New);
  const [open, setOpen] = useState(false);
  const [schedule,setSchedule] = useState<RecordLog|undefined>(undefined)
  const noteBox={
    [State.New]:NewCardBox,
    [State.Learning]:LearningCardBox,
    [State.Relearning]:RelearningCardBox,
    [State.Review]:ReviewCardBox
  }
  const setNoteBox={
    [State.New]:setNewCardBox,
    [State.Learning]:setLearningCardBox,
    [State.Relearning]:setRelearningCardBox,
    [State.Review]:setReviewCardBox
  }


  const handleChange = function(nextState: State,note:Note & { card: Card }){
    let change = State.New; // 默认状态转换为New
    switch (currentType) {
      case State.New:
        if (noteBox[State.Learning].length > 0) {
          change = State.Learning; // new -> learning
        } else if (noteBox[State.Relearning].length > 0) {
          change = State.Relearning; // new -> relearning
        } else if (noteBox[State.Review].length > 0) {
          change = State.Review; // new -> review
        }
        break;
      case State.Learning:
      case State.Relearning:
        if (noteBox[State.Review].length > 0) {
          change = State.Review; // learning/relearning -> review
        } else if (noteBox[currentType == State.Learning ? State.Relearning : State.Learning].length > 0) {
          change = currentType == State.Learning ? State.Relearning : State.Learning; // learning/relearning -> relearning/learning
        } else if (noteBox[State.New].length > 0) {
          change = State.New; // learning/relearning -> new
        }
        break;
      case State.Review:
        if (noteBox[State.Learning].length > 0) {
          change = State.Learning; // review -> learning
        } else if (noteBox[State.Relearning].length > 0) {
          change = State.Relearning; // review -> relearning
        } else if (noteBox[State.New].length > 0) {
          change = State.New; // review -> new
        }
        break;
    }
    
    // update state and data
    let updatedNoteBox:Array<Note & { card: Card }> = [ ...noteBox[currentType] ];
    updatedNoteBox= updatedNoteBox.slice(1);
    if (nextState !== State.Review) {
      if (currentType === State.Learning || currentType === State.Relearning) {
        setNoteBox[currentType]([...updatedNoteBox,note!]);
      }else{
        if (currentType === State.New) {
          setNoteBox[currentType](updatedNoteBox);
        }
        setNoteBox[currentType===State.Review ? State.Relearning: State.Learning](pre => [...pre, note!]);
      }
    }else{
      setNoteBox[currentType](updatedNoteBox);
    }
    console.log(`Change ${State[currentType]} to ${State[change]}, Card next State: ${State[nextState]}`);
    setCurrentType(change);
    return true;
  }


  const value = {
    open,
    setOpen,
    currentType,
    setCurrentType,
    schedule,
    setSchedule,
    noteBox:noteBox,
    setNoteBox:setNoteBox,
    handleChange
  };
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}
