"use client";
import { Card, Note } from "@prisma/client";
import { createContext, ReactNode, useContext, useRef, useState, useTransition } from "react";
import { RecordLog, State } from "ts-fsrs";
import { fixState } from "ts-fsrs/dist/help";

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
  handleRollBack:()=>Promise<Note & { card: Card }|undefined>;
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
  const [isPending, startTransition] = useTransition();
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

  const rollBackRef= useRef<{cid:number,nextState:State}[]>([])

  const handleChange = function(nextState: State,note:Note & { card: Card }){
    let change = State.New; // default State.New
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
    startTransition(()=>{ 
      // state update is marked as a transition, a slow re-render did not freeze the user interface.
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
      rollBackRef.current.push({
        cid:note.card.cid,
        nextState:nextState
      });
      console.log(`Change ${State[currentType]} to ${State[change]}, Card next State: ${State[nextState]},current rollback length ${rollBackRef.current.length}`);
      setCurrentType(change);
    })
    return true;
  }


  const handleRollBack = async function(){
    if(rollBackRef.current.length===0){
      return undefined;
    }
    const {cid,nextState}  = rollBackRef.current.pop()!;
    const rollbackNote =await fetch(`/api/fsrs?cid=${cid}&rollback=1`,{method:'PUT'})
                              .then(res =>res.json())
                              .then(res=>res.next) as Note & { card: Card }
    startTransition(()=>{
      const state= fixState(rollbackNote.card.state) // prisma State -> FSRS State
      if(nextState !== State.Review){
        const updatNoteBox = noteBox[nextState].slice(1)
        if (nextState===state){
          setNoteBox[state]([rollbackNote,...updatNoteBox]);
        }else{
          setNoteBox[nextState]([...updatNoteBox]);
        }
      }else{
        setNoteBox[state](pre => [rollbackNote,...pre]);
      }
      setCurrentType(state);
    })
    return rollbackNote;
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
    handleChange,
    handleRollBack
  };
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}
