"use client";

import { useTrainContext } from "@/context/TrainContext";

export default function TrainDisplay() {
  const { loading, loadTime, trainTime, totalTime, w } = useTrainContext();
  return (
    !loading &&
    loadTime &&
    trainTime && (
      <div className="flex justify-center">
        <div className="label flex flex-col gap-2">
          <p className="label-text w-full text-left">W: {JSON.stringify(w)}</p>
          <p className="label-text w-full text-left">Load time: {loadTime}</p>
          <p className="label-text w-full text-left">Train time: {trainTime}</p>
          <p className="label-text w-full text-left">Total time: {totalTime}</p>
        </div>
      </div>
    )
  );
}
