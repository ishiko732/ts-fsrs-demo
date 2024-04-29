"use client";
import { useTrainContext } from "@/context/TrainContext";

export default function TrainProgress() {
  const { progressRef, progressTextRef } = useTrainContext();
  return (
    <>
      {/* {loading ? (
        <progress className="progress w-56" ref={progressRef}></progress>
      ) : null} */}
      <progress className="progress w-64 my-4" ref={progressRef}></progress>
      <div ref={progressTextRef}></div>
    </>
  );
}
