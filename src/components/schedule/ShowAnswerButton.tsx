"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useCardContext } from "@/context/CardContext";
import { show_diff_message, Grades, Rating, State,Grade } from "ts-fsrs";
import debounce from "@/lib/debounce";

function ShowAnswerButton() {
  const {
    open,
    currentType,
    setOpen,
    schedule,
    noteBox,
    handleSchdule,
    handleRollBack
  } = useCardContext();


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
          await handleSchdule(Number(event.key) as Grade)
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
      className="btn mt-4 tooltip tooltip-bottom"
      onClick={() => {
        setOpen(true);
      }}
      data-tip="Press Space to show answer"
    >
      show answer
    </button>
  ) : (
    schedule && (
      <div className="flex justify-center pt-6">
        {Grades.map((grade: Grade) =>
          show_diff_message(
            schedule[grade].card.due,
            schedule[grade].card.last_review as Date,
            true
          )
        ).map((time: string, index: number) => (
          <button
            key={Rating[(index + 1) as Grade]}
            className={"btn mx-2 btn-sm md:btn-md tooltip tooltip-bottom " + color[index]}
            onClick={async(e) => await handleSchdule( (index + 1) as Grade)}
            data-tip={time}
          >
            <span>{Rating[(index+1)as Grade]}</span>
            <span className="hidden sm:inline"><kbd className={`kbd kbd-sm dark:text-black dark:bg-slate-200`}>{index+1}</kbd></span>
          </button>
        ))}
      </div>
    )
  );
}

export default ShowAnswerButton;
