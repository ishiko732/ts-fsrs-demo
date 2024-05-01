"use client";

import { useTrainContext } from "@/context/TrainContext";

export default function NextDayStartAt() {
  const { nextDayStart, setNextDayStart } = useTrainContext();

  const handlClick = (next: number) => {
    setNextDayStart(next);
  };

  return (
    <label className="form-control w-full max-w-xs pb-4">
      <div className="label">
        <span className="label-text">Next Day Starts at</span>
      </div>
      <input
        type="number"
        step={1}
        min={0}
        max={24}
        className="input input-bordered w-full max-w-xs"
        value={nextDayStart}
        onChange={(e) => handlClick(Number(e.target.value))}
      />
    </label>
  );
}
