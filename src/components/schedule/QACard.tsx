'use client'
import ScheduleCard from "./ScheduleCard";
import { useCardContext } from "@/context/CardContext";

export default function QACard() {
  const { currentType, noteBox } = useCardContext();
  const note = noteBox[currentType][0];
  return (
    <>
      <div className="item-center">
        <div className="w-full">
          <span className="flex justify-center items-center text-2xl">
            {note?.question}
          </span>
        </div>
      </div>
      <ScheduleCard />
    </>
  );
}
