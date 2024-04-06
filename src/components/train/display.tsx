"use client";

import { useTrainContext } from "@/context/TrainContext";
import { useState } from "react";

export default function TrainDisplay() {
  const { loading, loadTime, trainTime, totalTime, w } = useTrainContext();
  const [ok, setOk] = useState(false);
  const handleClick = async () => {
    // copy w to chipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(JSON.stringify(w));
      setOk(true);
      setTimeout(() => {
        setOk(false);
      }, 1000);
    }
  };
  return (
    !loading &&
    loadTime &&
    trainTime && (
      <div className="flex justify-center">
        <div className="label flex flex-col gap-2">
          <p className="label-text w-full text-left">W: {JSON.stringify(w)}</p>
          <p className="label-text w-full text-left">
            <button className="btn" onClick={handleClick}>
              Copy w
            </button>
            {ok && <span className="label-text">Copied!</span>}
          </p>
          <p className="label-text w-full text-left">Load time: {loadTime}</p>
          <p className="label-text w-full text-left">Train time: {trainTime}</p>
          <p className="label-text w-full text-left">Total time: {totalTime}</p>
        </div>
      </div>
    )
  );
}
