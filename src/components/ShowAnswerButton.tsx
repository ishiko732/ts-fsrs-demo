"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useCardContext } from "@/context/CardContext";
import { show_diff_message, Grades, Rating, State,Grade } from "ts-fsrs";

function ShowAnswerButton() {
  const {
    open,
    currentType,
    setOpen,
    schedule,
    noteBox,
    handleChange,
    handleRollBack
  } = useCardContext();
  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    grade: Grade
  ) => {
    fetch(`/api/fsrs?cid=${note.card.cid}&now=${new Date()}&grade=${grade}`, {
      method: "put",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          handleChange(res,note);
          setOpen(false);
        }
      });
  };
  const handleKeyPress = useCallback(async (event:React.KeyboardEvent<HTMLElement>) => {
    // Call updateCalc here
    if(!open&&event.code === 'Space'){
      setOpen(true)
    }else if (open){
      switch (event.key) {
        case '1':
        case '2':
        case '3':
        case '4':
          await handleClick(event as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>,Number(event.key) as Grade)
          break;
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key ==='z'){
      await handleRollBack()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    // attach the event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyPress(event as unknown as React.KeyboardEvent<HTMLElement>);
    };
    document.addEventListener('keydown', handleKeyDown);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  const note = noteBox[currentType][0];
  if (!note) return null;
  const color = ["btn-error", "btn-warning", "btn-info", "btn-success"];
  return !open ? (
    <button
      className="btn mt-4"
      onClick={() => {
        setOpen(true);
      }}
    >
      show answer <kbd className={`kbd kbd-sm dark:text-black dark:bg-slate-200`}></kbd>
    </button>
  ) : (
    schedule && (
      <div className="flex justify-center pt-4">
        {Grades.map((grade: Grade) =>
          show_diff_message(
            schedule[grade].card.due,
            schedule[grade].card.last_review as Date,
            true
          )
        ).map((time: string, index: number) => (
          <button
            key={Rating[(index + 1) as Grade]}
            className={"btn mx-2 " + color[index]}
            onClick={(e) => handleClick(e, (index + 1) as Grade)}
          >
            <span>{time}</span>
            <span><kbd className={`kbd kbd-sm dark:text-black dark:bg-slate-200`}>{index+1}</kbd></span>
          </button>
        ))}
      </div>
    )
  );
}

export default ShowAnswerButton;
