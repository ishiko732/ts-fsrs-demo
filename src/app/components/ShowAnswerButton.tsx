"use client";

import React from "react";
import { useCardContext } from "../context/CardContext";
import { show_diff_message, Grades, Rating, State,Grade } from "ts-fsrs";

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
    fetch(`/api/fsrs?nid=${note!.nid}&now=${new Date()}&grade=${grade}`, {
      method: "put",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0) {
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
          let updatedNoteBox = [ ...noteBox[currentType] ];
          updatedNoteBox = updatedNoteBox.slice(1);
          if (res.next !== State.Review) {
            if (currentType === State.Learning || currentType === State.Relearning) {
              setNoteBox[currentType]([updatedNoteBox,note!]);
            }else{
              if (currentType === State.New) {
                setNoteBox[currentType](updatedNoteBox);
              }
              setNoteBox[currentType===State.Review ? State.Relearning: State.Learning](pre => [...pre, note!]);
            }
          }else{
            setNoteBox[currentType](updatedNoteBox);
          }
          console.log(`Change ${State[currentType]} to ${State[change]}, Card next State: ${State[res.next]}`);
          setCurrentType(change);
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
