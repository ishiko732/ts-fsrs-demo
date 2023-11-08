"use client";

import React from "react";
import { useCardContext } from "../context/CardContext";
import { show_diff_message, Grades, Rating, State } from "ts-fsrs";
import type { Grade } from "ts-fsrs/dist/models";

function ShowAnswerButton() {
  const {
    open,
    currentType,
    setCurrentType,
    setOpen,
    schedule,
    noteBox,
    setNoteBox,
  } = useCardContext();
  const note = noteBox[currentType][0];
  if (!note) return null;
  const color = ["btn-error", "btn-warning", "btn-info", "btn-success"];
  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    grade: Grade
  ) => {
    fetch(`/api/fsrs?nid=${note!.nid}&now=` + new Date() + "&grade=" + grade, {
      method: "put",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
          var change =1; // new -> learning
          switch (currentType) {
            case State.New:
                // updateCurrentType
                change =State.Learning; // new -> learning
                if (noteBox[State.Learning].length === 0) {
                  change = State.Relearning; // new -> relearning
                  if (noteBox[State.Relearning].length === 0) {
                    change = State.Review; // new -> review
                  }
                  if(noteBox[State.Review].length === 0){
                    change = State.New; // new -> new
                  }
                } 
              setNoteBox[State.New]((pre) => [...pre.slice(1)]); //noteBox[State.New].slice(1)
              if (res.next !== State.Review) {
                setNoteBox[State.Learning]((pre) => [...pre, note!]);
                // change = (change === State.Learning ? State.New : change);
              }
              break;
            case State.Learning:
            case State.Relearning:
              setNoteBox[currentType]((pre) =>
                res.next === State.Review ? [...pre.slice(1)] : [...pre.slice(1), note!] //noteBox[currentType].slice(0)
              );
              change =State.Review; // Learning/Relearning -> review
              if (noteBox[State.Review].length === 0) {
                change = change==State.Review ? currentType == State.Learning?State.Relearning:State.Learning:change; // Learning/Relearning -> Relearning/Learning
                if (noteBox[currentType == State.Learning?State.Relearning:State.Learning].length === 0) {
                  change = State.New; // Learning/Relearning  -> New
                  if (noteBox[State.New].length === 0) {
                    change = currentType == State.Learning?State.Relearning:State.Learning; // Learning/Relearning  -> Learning
                  }
                }
              }
              break;
            case 3:
              setNoteBox[State.Review]((pre) => [...pre.slice(1)]);
              change = State.Learning // review -> learning
              if (noteBox[State.Learning].length === 0) {
                change = State.Relearning; // review-> Relearning
                if  (noteBox[State.Relearning].length === 0) {
                  change = State.New; // Learning/Relearning  -> new
                }
              }
              if (res.next !== State.Review) {
                setNoteBox[State.Relearning]((pre) => [...pre, note!]);
                // change = (change === State.Relearning ? 1 : change);
              }
              break;
          }
          console.log(`change ${State[currentType]} to ${State[change]},Card next State:${State[res.next]}`)
          setCurrentType(change)
          setOpen(false);
        }
      });
  };
  return !open ? (
    <button
      className="btn mt-4"
      onClick={() => {
        setOpen(true);
      }}
    >
      show answer
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
            {time}
          </button>
        ))}
      </div>
    )
  );
}

export default ShowAnswerButton;
