import { Card, Note } from "@prisma/client";
import ScheduleCard from "./ScheduleCard";
import { useState } from "react";
import { useCardContext } from "../context/CardContext";

export default function QACard() {
  const { noteBox, currentType, index,setOpen,open } = useCardContext();
  if (noteBox.length === 0) return null;
  const note = noteBox[currentType][index];
  return (
    <>
      <div className="item-center">
        <div className="w-full">
          <span className="flex justify-center items-center text-2xl">
            {note?.question}
          </span>
        </div>
      </div>
      <ScheduleCard/>
    </>
  );
}
