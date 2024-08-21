'use client';

import { changeResponse } from '@/context/CardContext';
import { CardBoxes } from './useCardBoxes';
import { Card, Note } from '@prisma/client';
import { ChangeState, useChangeState } from './useChangeState';
import { Grade, RecordLog, State, fixDate, fsrs } from 'ts-fsrs';
import { startTransition, useEffect, useState } from 'react';
import { Rollback } from './useRollback';
import { debounce } from '@/lib/utils';
import callHandler from '@/components/source/call';

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
  handleChange: (
    res: changeResponse,
    note: Note & { cards: Card[] }
  ) => boolean;
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
    note: Note & { cards: Card[] }
  ) {
    const { nextState, nextDue, suspended } = res;
    if (nextDue) {
      note.cards[0].due = nextDue;
    }
    const change = updateStateBox(noteBox, currentType, nextDue);
    // update state and data
    let updatedNoteBox: Array<Note & { cards: Card[] }> = [
      ...noteBox[currentType],
    ];
    updatedNoteBox = updatedNoteBox.slice(1);
    updatedNoteBox = updatedNoteBox.toSorted(
      (a, b) =>
        fixDate(a.cards[0].due).getTime() - fixDate(b.cards[0].due).getTime()
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
        cid: note.cards[0].cid,
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
        note.cards[0].cid
      }&now=${now.getTime()}&offset=${now.getTimezoneOffset()}&grade=${grade}&duration=${duration}`,
      {
        method: 'put',
      }
    ).then((res) => res.json());
    if (res.code === 0) {
      console.log(`[cid:${note.cards[0].cid}]duration:${duration}ms`);
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
          note.cards[0].cid
        }&now=${now.getTime()}&offset=${now.getTimezoneOffset()}`,
        { method: 'post' }
      )
        .then((res) => res.json())
        .then((res) => {
          setSchedule(res);
          setShowTime(new Date().getTime());
        });
      if (note.cards && note.cards[0].state === 'Review') {
        const r = fsrs().get_retrievability(
          note.cards[0],
          fixDate(new Date().toLocaleString('UTC', { timeZone: 'UTC' })),
          true
        );
        if (r) {
          setDSR({
            D: note.cards[0].difficulty,
            S: Math.round(note.cards[0].stability),
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
