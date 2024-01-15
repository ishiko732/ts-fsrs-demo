"use client";
import { Card, Note } from "@prisma/client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Grade, RecordLog, State, fixDate, fixState } from "ts-fsrs";
import { useRouter } from "next/navigation";
import { StateBox } from "@/types";
import debounce from "@/lib/debounce";

type changeResponse = {
  code: number;
  nextState: State;
  nextDue?:Date;
}

type CardContextProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentType: StateBox;
  setCurrentType: React.Dispatch<React.SetStateAction<StateBox>>;
  schedule:RecordLog|undefined;
  setSchedule:React.Dispatch<React.SetStateAction<RecordLog|undefined>>;
  noteBox:{[key in StateBox]:Array<Note & { card: Card }>};
  setNoteBox:{[key in StateBox]:React.Dispatch<React.SetStateAction<Array<Note & { card: Card }>>>};
  handleSchdule:(grade: Grade)=>Promise<boolean>;
  handleRollBack:()=>Promise<Note & { card: Card }|undefined>;
  rollbackAble:boolean;
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
  const [LearningCardBox,setLearningCardBox] = useState(() => {
    const l = []
    if (LearningCard){
      l.push(...LearningCard)
    }
    if(RelearningCard){
      l.push(...RelearningCard)
    }
    return l
  })
  const [ReviewCardBox,setReviewCardBox] = useState(ReviewCard)
  const [open, setOpen] = useState(false);
  const [schedule,setSchedule] = useState<RecordLog|undefined>(undefined)
  const noteBox = useMemo(() => ({
    [State.New]: NewCardBox,
    [State.Learning]: LearningCardBox,
    [State.Review]: ReviewCardBox
  }), [NewCardBox, LearningCardBox, ReviewCardBox]);
  const setNoteBox=useMemo(()=>({
    [State.New]:setNewCardBox,
    [State.Learning]:setLearningCardBox,
    [State.Review]:setReviewCardBox
  }),[setNewCardBox, setLearningCardBox, setReviewCardBox])
  const [currentType, setCurrentType] = useState<StateBox>(() => {
    let current:StateBox = State.New;
    for(let i=0;i<3;i++){
      if(noteBox[current].length>0){
        break
      }
      current = (current+1)%3 as StateBox
    }
    return current;
  });

  const rollBackRef= useRef<{cid:number,nextStateBox:StateBox}[]>([])
  const [rollbackAble,setRollbackAble] = useState(false)

  const handleChange = function(res: changeResponse,note:Note & { card: Card }){
    const {nextState,nextDue} = res;
    if(nextDue){
      note.card.due = nextDue;
    }
    const change = updateStateBox(noteBox, currentType, nextDue);
    // update state and data
    let updatedNoteBox:Array<Note & { card: Card }> = [ ...noteBox[currentType] ];
    updatedNoteBox = updatedNoteBox.slice(1);
    updatedNoteBox = updatedNoteBox.toSorted((a,b)=>fixDate(a.card.due).getTime()-fixDate(b.card.due).getTime())
    startTransition(()=>{ 
      // state update is marked as a transition, a slow re-render did not freeze the user interface.
      if (nextState !== State.Review) {
        if (currentType === State.Learning) {
          setNoteBox[currentType]([...updatedNoteBox,note!]);
          console.log([...updatedNoteBox,note!])
        }else{
          if (currentType === State.New || currentType === State.Review) {
            setNoteBox[currentType](updatedNoteBox);
          }
          setNoteBox[State.Learning](pre => [...pre, note!]);
        }
      }else{
        setNoteBox[currentType](updatedNoteBox);
      }
      rollBackRef.current.push({
        cid:note.card.cid,
        nextStateBox:nextState===State.Relearning? State.Learning: nextState
      });
      if(rollBackRef.current.length>0 && rollbackAble===false){
        setRollbackAble(true)
      }
      console.log(`Change ${State[currentType]} to ${State[change]}, Card next State: ${State[nextState]},current rollback length ${rollBackRef.current.length}`);
      setCurrentType(change);
    })
    return true;
  }

  const handleSchdule = debounce(async (grade: Grade) => {
    const note = noteBox[currentType][0];
    const res = await fetch(`/api/fsrs?cid=${note.card.cid}&now=${new Date()}&grade=${grade}`, {
      method: "put",
    }).then((res) => res.json())
    if (res.code === 0) {
      handleChange(res,note);
      setOpen(false);
    }
    return res.code === 0?true: false;
  });

  const _handleRollBack = async function(){
    if(rollBackRef.current.length===0){
      return undefined;
    }
    const {cid, nextStateBox}  = rollBackRef.current.pop()!;
    const rollbackNote =await fetch(`/api/fsrs?cid=${cid}&rollback=1`,{method:'PUT'})
                              .then(res =>res.json())
                              .then(res=>res.next) as Note & { card: Card }
    startTransition(()=>{
      let state = fixState(rollbackNote.card.state) // prisma State -> FSRS State
      if (state === State.Relearning){
        state = State.Learning
      }
      // state = rollback state
      if(nextStateBox !== State.Review){
        const updatNoteBox = noteBox[nextStateBox].filter(note=>note.card.cid!==cid); // filter out the rollback note
        console.log(`Rollback Box:${State[nextStateBox]} to ${State[state]}`);
        if (nextStateBox===state){ // learning === learning or relearning === relearning
          setNoteBox[state]([rollbackNote,...updatNoteBox]);
        }else{
          setNoteBox[nextStateBox]([...updatNoteBox]);
          if(state===State.Review || state===State.New){
            setNoteBox[state](pre => [rollbackNote,...pre]);
          }
        }
      }else{
        setNoteBox[state](pre => [rollbackNote,...pre]);
      }
      setCurrentType(state);
    })
    if(rollBackRef.current.length===0){
      setRollbackAble(false)
    }
    if(open){
      setOpen(false)
    }
    return rollbackNote;
  }
  const handleRollBack= debounce(_handleRollBack);

  useEffect(()=>{
    const {finished,transferState} = checkFinished(noteBox,currentType)
    if(finished){
      router.refresh();
      console.log("ok")
    }
    if(transferState !== currentType){
      startTransition(()=>{
        setCurrentType(transferState)
      })
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[noteBox,currentType])

  // get schedule
  useEffect(() => {
    const note=noteBox[currentType][0]
    if (note) {
      fetch(`/api/fsrs?cid=${note.card.cid}&now=` + new Date(), { method: "post" })
        .then((res) => res.json())
        .then((res) => setSchedule(res));
    }
  }, [currentType,noteBox, setSchedule]);


  const value = {
    open,
    setOpen,
    currentType,
    setCurrentType,
    schedule,
    setSchedule,
    noteBox:noteBox,
    setNoteBox:setNoteBox,
    handleSchdule,
    handleRollBack,
    rollbackAble
  };
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

function RandomNewOrReviewState(noteBox: { [key in StateBox]: Array<Note & { card: Card }> }){
  if (noteBox[State.New].length === 0 ) {
    return State.Review;
  }else if (noteBox[State.Review].length === 0 ) {
    return State.New;
  }else{
    return Math.random()>0.5? State.Review: State.New
  }
}

function updateStateBox(noteBox: { [key in StateBox]: Array<Note & { card: Card }> },currentType:StateBox,nextDue?:Date){
  let change:StateBox = State.New; // default State.New
  switch (currentType) {
    case State.New:
      if (noteBox[State.Learning].length > 0) {
        change = State.Learning; // new -> learning
      } else if (noteBox[State.Review].length > 0) {
        change = State.Review; // new -> review
      }
      break;
    case State.Learning:
      if (noteBox[State.Review].length > 0) {
        change = State.Review; // learning/relearning -> review
      } else if (noteBox[State.New].length > 0) {
        change = State.New; // learning/relearning -> new
      }else {
        change = State.Learning; // learning/relearning -> learning/relearning
      }
      break;
    case State.Review:
      if (noteBox[State.Learning].length > 0) {
        change = State.Learning; // review -> learning
      } else if (noteBox[State.New].length > 0) {
        change = State.New; // review -> new
      } else {
        change = State.Review; // review -> review
      }
      break;
  }
  change = change===State.Learning && noteBox[State.Learning].length>0&& fixDate(noteBox[State.Learning][0].card.due).getTime()-new Date().getTime()>0 ? RandomNewOrReviewState(noteBox) : change;
  return change
}

const checkFinished=(noteBox: { [key in StateBox]: Array<Note & { card: Card }> },currentType:StateBox) => {
  let current:StateBox = currentType;
  let i =0;
  for(;i<3;i++){
    if(noteBox[current].length>0){
      if(current===State.Learning){
        const due = fixDate(noteBox[current][0].card.due);
        if(due.getTime()-new Date().getTime()>0){
          break
        }
      }
      break
    }
    current = (current+1)%3
  }
  return {
    finished: i === 3,
    transferState: current
  };
}