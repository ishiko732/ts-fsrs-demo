"use client";

import React from "react";
import { useCardContext } from "../context/CardContext";
import { show_diff_message, Grades, Rating } from "ts-fsrs";
import type { Grade } from "ts-fsrs/dist/models";

function ShowAnswerButton() {
  const { setOpen, open, schedule, currentType, index,noteBox,setIndex } = useCardContext();
  const note = noteBox[currentType][index];
  const color = ["btn-error", "btn-warning", "btn-info", "btn-success"];
  const handleClick= async (e:React.MouseEvent<HTMLButtonElement, MouseEvent>,grade:Grade)=>{
    fetch(`/api/fsrs?nid=${note.nid}&now=`+new Date()+"&grade="+grade, { method: "put" })
        .then((res) => res.json())
        .then((res) => {if(res.code===0){
         setIndex(pre=>pre+1)
        }});
  }
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
          key = {Rating[index+1 as Grade]}
          className={"btn mx-2 " + color[index]} onClick={(e)=>handleClick(e,index+1 as Grade)}>{time}</button>
        ))}
      </div>
    )
  );
}

export default ShowAnswerButton;
