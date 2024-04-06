"use client";

import { getProcessW, loadCsvAndTrain } from "@/app/api/fsrs/train/train";
import { useTrainContext } from "@/context/TrainContext";
import { useEffect, useRef, useState } from "react";

export default function FileTrain() {
  const workerRef = useRef<Worker>();
  const trainTimeRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const { loading, setLoading, setW, setLoadTime, setTrainTime, setTotalTime } =
    useTrainContext();

  const handleClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    setLoading(true);
    const file = e.target.files[0];
    trainTimeRef.current = performance.now();
    workerRef.current?.postMessage(file);
    if (e.target.value) {
      e.target.value = "";
    }
  };

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("@/../public/fsrs_worker.ts", import.meta.url)
    );
    workerRef.current.onmessage = (event: MessageEvent<TrainResult>) => {
      const endTime = performance.now();
      console.log(event.data)
      setW(getProcessW(event.data.w));
      setLoadTime(event.data.loadTime)
      setTrainTime(event.data.trainTime);
      setTotalTime(event.data.totalTime);
      setLoading(false);
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
