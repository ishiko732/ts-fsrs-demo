"use client";

import type { CardServiceType } from "@server/services/decks/cards";
import { startTransition, useEffect, useState } from "react";
import { fixDate, fsrs,type Grade, type RecordLog, State } from "ts-fsrs";

import callHandler from "@/components/source/call";
import { type changeResponse } from "@/context/CardContext";
import debounce from "@/lib/debounce";

import { type CardBoxes } from "./useCardBoxes";
import {  useChangeState } from "./useChangeState";
import { type Rollback } from "./useRollback";

type SchduleProps = CardBoxes &
  Rollback & {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };

export type DSR = {
  D: number;
  S: number;
  R: string;
};

export type Schedule = {
  showTime: number;
  setShowTime: React.Dispatch<React.SetStateAction<number>>;
  DSR: DSR | undefined;
  setDSR: React.Dispatch<React.SetStateAction<DSR | undefined>>;
  schedule: RecordLog | undefined;
  setSchedule: React.Dispatch<React.SetStateAction<RecordLog | undefined>>;
  handleChange: (res: changeResponse, note: Awaited<ReturnType<CardServiceType['getDetail']>>['card']) => boolean;
  handleSchdule: (grade: Grade) => Promise<boolean>;
};

export function useSchedule({
  noteBox,
  currentType,
  setCurrentType,
  setNoteBox,
  rollBackRef,
  rollbackAble,
  setRollbackAble,
  setOpen,
}: SchduleProps) {
  const { updateStateBox } = useChangeState();
  const [showTime, setShowTime] = useState(new Date().getTime());
  const [DSR, setDSR] = useState<DSR>();
  const [schedule, setSchedule] = useState<RecordLog | undefined>(undefined);

  const handleChange = function (
    res: changeResponse,
    note: Awaited<ReturnType<CardServiceType['getDetail']>>['card']
  ) {
    const { nextState, nextDue, suspended } = res;
    if (nextDue) {
      note.due = +nextDue;
    }
    const change = updateStateBox(noteBox, currentType, nextDue);
    // update state and data
    let updatedNoteBox: Array<Awaited<ReturnType<CardServiceType['getDetail']>>['card']> = [
      ...noteBox[currentType],
    ];
    updatedNoteBox = updatedNoteBox.slice(1);
    updatedNoteBox = updatedNoteBox.toSorted(
      (a, b) => fixDate(a.due).getTime() - fixDate(b.due).getTime()
    );
    startTransition(() => {
      // state update is marked as a transition, a slow re-render did not freeze the user interface.
      // if suspended, the card will not be added to the learning box
      if (nextState !== State.Review && !suspended) {
        if (currentType === State.Learning) {
          setNoteBox[currentType]([...updatedNoteBox, note!]);
          console.log([...updatedNoteBox, note!]);
        } else {
          if (currentType === State.New || currentType === State.Review) {
            setNoteBox[currentType](updatedNoteBox);
          }
          setNoteBox[State.Learning]((pre) => [...pre, note!]);
        }
      } else {
        setNoteBox[currentType](updatedNoteBox);
      }
      rollBackRef.current.push({
        cid: note.cid,
        nextStateBox:
          nextState === State.Relearning ? State.Learning : nextState,
      });
      if (rollBackRef.current.length > 0 && rollbackAble === false) {
        setRollbackAble(true);
      }
      console.log(
        `Change ${State[currentType]} to ${State[change]}, Card next State: ${State[nextState]},current rollback length ${rollBackRef.current.length}`
      );
      setCurrentType(change);
      callHandler({ ...note }, res);
    });
    return true;
  };

  const handleSchdule = debounce(async (grade: Grade) => {
    const note = noteBox[currentType][0];
    const now = new Date();
    const duration = now.getTime() - showTime;
    const res = await fetch(
      `/api/fsrs?cid=${
        note.cid
      }&now=${now.getTime()}&offset=${now.getTimezoneOffset()}&grade=${grade}&duration=${duration}`,
      {
        method: "put",
      }
    ).then((res) => res.json());
    if (res.code === 0) {
      console.log(`[cid:${note.cid}]duration:${duration}ms`);
      handleChange(res, note);
      setOpen(false);
    }
    return res.code === 0 ? true : false;
  });
  // get schedule
  useEffect(() => {
    const note = noteBox[currentType][0];
    const now = new Date();
    if (note) {
      fetch(
        `/api/fsrs?cid=${
          note.cid
        }&now=${now.getTime()}&offset=${now.getTimezoneOffset()}`,
        { method: "post" }
      )
        .then((res) => res.json())
        .then((res) => {
          setSchedule(res);
          setShowTime(new Date().getTime());
        });
      if (note.state === State.Review) {
        const r = fsrs().get_retrievability(
          note,
          fixDate(new Date().toLocaleString("UTC", { timeZone: "UTC" })),
          true
        );
        if (r) {
          setDSR({
            D: note.difficulty,
            S: Math.round(note.stability),
            R: r,
          });
        } else {
          setDSR(undefined);
        }
      } else {
        setDSR(undefined);
      }
    }
  }, [currentType, noteBox, setSchedule]);

  const value: Schedule = {
    showTime,
    setShowTime,
    DSR,
    setDSR,
    schedule,
    setSchedule,
    handleChange,
    handleSchdule,
  };
  return value;
}
