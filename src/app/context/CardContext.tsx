"use client";
import { Card, Note } from "@prisma/client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { RecordLog, State, fixDate, fixState } from "ts-fsrs";
import { useRouter } from "next/navigation";

type changeResponse = {
  code: number;
  nextState: State;
  nextDue?:Date;
}

type CardContextProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentType: State;
  setCurrentType: React.Dispatch<React.SetStateAction<State>>;
  schedule:RecordLog|undefined;
  setSchedule:React.Dispatch<React.SetStateAction<RecordLog|undefined>>;
  noteBox:{[key in State]:Array<Note & { card: Card }>};
  setNoteBox:{[key in State]:React.Dispatch<React.SetStateAction<Array<Note & { card: Card }>>>};
  handleChange:(res: changeResponse,note:Note & { card: Card })=>boolean;
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
  const router = useRouter();
  const [NewCard, LearningCard, RelearningCard, ReviewCard] = noteBox0;
  const [NewCardBox,setNewCardBox] = useState(NewCard)
  const [LearningCardBox,setLearningCardBox] = useState(LearningCard)
  const [RelearningCardBox,setRelearningCardBox] = useState(RelearningCard)
  const [ReviewCardBox,setReviewCardBox] = useState(ReviewCard)
  const [open, setOpen] = useState(false);
  const [schedule,setSchedule] = useState<RecordLog|undefined>(undefined)
  const noteBox = useMemo(() => ({
    [State.New]: NewCardBox,
    [State.Learning]: LearningCardBox,
    [State.Relearning]: RelearningCardBox,
    [State.Review]: ReviewCardBox
  }), [NewCardBox, LearningCardBox, RelearningCardBox, ReviewCardBox]);
  const setNoteBox=useMemo(()=>({
    [State.New]:setNewCardBox,
    [State.Learning]:setLearningCardBox,
    [State.Relearning]:setRelearningCardBox,
    [State.Review]:setReviewCardBox
  }),[setNewCardBox,setLearningCardBox,setRelearningCardBox,setReviewCardBox])
  const [currentType, setCurrentType] = useState<State>(function(){
    let current = State.New;
    for(let i=0;i<4;i++){
      if(noteBox[current].length>0){
        break
      }
      current = (current+1)%4
    }
    return current;
  });

  const rollBackRef= useRef<{cid:number,nextState:State}[]>([])

  const handleChange = function(res: changeResponse,note:Note & { card: Card }){
    let change = State.New; // default State.New
    const {nextState,nextDue} = res;
    if(nextDue){
      note.card.due = nextDue;
    }
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
        if (nextDue && (change===State.Learning||change===State.Relearning)) {
          change = fixDate(note.card.due).getTime()-new Date().getTime()>0 ? State.New : change;
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
        change = change===State.Learning && noteBox[State.Learning].length>0&& fixDate(noteBox[State.Learning][0].card.due).getTime()-new Date().getTime()>0 ? State.New : change;
        change = change===State.Relearning && noteBox[State.Relearning].length>0&& fixDate(noteBox[State.Relearning][0].card.due).getTime()-new Date().getTime()>0 ? State.Review : change;
        break;
    }
    
    // update state and data
    let updatedNoteBox:Array<Note & { card: Card }> = [ ...noteBox[currentType] ];
    updatedNoteBox= updatedNoteBox.slice(1).toSorted((a,b)=>a.card.due.getTime()-b.card.due.getTime());
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

  useEffect(()=>{
    let current = currentType;
    let i =0;
    for(;i<4;i++){
      if(noteBox[current].length>0){
        break
      }
      current = (current+1)%4
    }
    if(i==4){
      router.refresh();
      console.log("ok")
    }
    if(current!==currentType){
      startTransition(()=>{
        setCurrentType(current)
      })
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[noteBox,currentType])


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
