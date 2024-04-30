"use client";

import { getProcessW } from "@/app/api/fsrs/train/train";
import { useTrainContext } from "@/context/TrainContext";
import { computerMinuteOffset } from "@/lib/date";
import { useEffect, useRef } from "react";

export default function FileTrain() {
  const workerRef = useRef<Worker>();
  const timeIdRef = useRef<NodeJS.Timeout>();
  const {
    loading,
    setLoading,
    setW,
    setLoadTime,
    setTrainTime,
    setTotalTime,
    timezone,
    nextDayStart,
    handleProgress,
  } = useTrainContext();

  const handleClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    setLoading(true);
    const file = e.target.files[0];
    const offset = computerMinuteOffset(timezone, nextDayStart);
    workerRef.current?.postMessage({ file, offset });
    if (e.target.value) {
      e.target.value = "";
    }
  };

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./fsrs_worker.ts", import.meta.url)
    );
    workerRef.current.onmessage = (
      event: MessageEvent<TrainResult | ProgressState>
    ) => {
      console.log(event.data);
      if ("tag" in event.data) {
        // process ProgressState
        const progressState = event.data as ProgressState;
        if (progressState.tag === "start") {
          const { wasmMemoryBuffer, pointer } = progressState;
          handleProgress(wasmMemoryBuffer, pointer);
          timeIdRef.current = setInterval(() => {
            handleProgress(wasmMemoryBuffer, pointer);
          }, 100);
        } else if (progressState.tag === "finish") {
          clearInterval(timeIdRef.current);
          console.log("finish");
        }
      } else {
        // process TrainResult
        const trainResult = event.data as TrainResult;
        setW(getProcessW(trainResult.w));
        setLoadTime(trainResult.loadTime);
        setTrainTime(trainResult.trainTime);
        setTotalTime(trainResult.totalTime);
        setLoading(false);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <input
        disabled={loading}
        type="file"
        className="file-input w-full max-w-xs"
        onChange={(e) => handleClick(e)}
        accept=".csv"
      />
    </>
  );
}
