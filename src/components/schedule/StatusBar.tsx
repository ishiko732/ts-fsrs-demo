"use client";
import React from "react";
import { useCardContext } from "@/context/CardContext";
import { State } from "ts-fsrs";

export default function StatusBar() {
  const { noteBox, currentType } = useCardContext();

  return (
    <div className="flex justify-center text-white">
      <div className={"badge badge-info gap-2 m-1 p-4 text-white"}>
        {currentType === State.New ? (
          <span className="underline underline-offset-4">
            {noteBox[State.New].length}
          </span>
        ) : (
          noteBox[State.New].length
        )}
      </div>
      <div className="badge badge-error gap-2 m-1 p-4 text-white">
        {currentType === State.Learning ? (
          <span className="underline underline-offset-4">{noteBox[State.Learning].length}</span>
        ) : (
          noteBox[State.Learning].length
        )}
      </div>
      <div className="badge badge-success gap-2 m-1 p-4 text-white">
        {currentType === State.Review ? (
          <span className="underline underline-offset-4">
            {noteBox[State.Review].length}
          </span>
        ) : (
          noteBox[State.Review].length
        )}
      </div>
    </div>
  );
}
