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
              // if (noteBox[State.New].length === 1) {
                // updateCurrentType
                change =1; // new -> learning
                if (noteBox[State.Learning].length === 0) {
                  change = 2; // new -> relearning
                }
                if (noteBox[State.Relearning].length === 0) {
                  change = 3; // new -> review
                }
              // }
              setNoteBox[State.New]((pre) => [...pre.slice(1)]); //noteBox[State.New].slice(1)
              if (res.next !== State.Review) {
                setNoteBox[State.Learning]((pre) => [...pre, note!]);
                change = (change === 1 ? 2 : change);
              }
              break;
            case State.Learning:
            case State.Relearning:
              setNoteBox[currentType]((pre) =>
                res.next !== State.Review ? [...pre.slice(0)] : [...pre, note!]
              );
              change =3; // Learning/Relearning -> review
              if (noteBox[State.Review].length === 0) {
                change = currentType==1?2:1; // Learning/Relearning -> Relearning/Learning
              }
              if (noteBox[State.Learning].length === 0) {
                change = 0; // Learning/Relearning  -> new
              }
              if (noteBox[State.New].length === 0) {
                change = 2; // Learning/Relearning  -> Learning
              }
              if (noteBox[State.Relearning].length === 0) {
                change = 3; // Learning/Relearning  -> review
              }
              break;
            case 3:
              setNoteBox[State.Review]((pre) => [...pre.slice(0)]);
              change = 1 // review -> learning
              if (noteBox[State.Learning].length === 0) {
                change = 2; // review-> Relearning
              }
              if (noteBox[State.Relearning].length === 0) {
                change = 0; // Learning/Relearning  -> new
              }
              if (res.next !== State.Review) {
                setNoteBox[State.Relearning]((pre) => [...pre, note!]);
                change = (change === 2 ? 1 : change);
              }
              break;
          }
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
