"use client";

import { getProcessW, loadCsvAndTrain } from "@/app/api/fsrs/train/train";
import { useTrainContext } from "@/context/TrainContext";
import { useEffect, useState } from "react";

export default function FileTrain() {
  const [basePath, setBasePath] = useState("");
  const { loading, setLoading, setW, setLoadTime, setTrainTime, setTotalTime } =
    useTrainContext();
  useEffect(() => {
    setBasePath(window.location.origin);
  }, []);
  const handleClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const wasmURL = new URL("fsrs_browser_bg.wasm", basePath);

    if (!e.target.files) {
      return;
    }
    setLoading(true);
    const result = await loadCsvAndTrain(wasmURL, e.target.files[0]);
    if (e.target.value) {
      e.target.value = "";
    }
    setLoading(false);
    setLoadTime(result.loadTime);
    setTrainTime(result.trainTime);
    setTotalTime(result.totalTime);
    setW(getProcessW(result.w));
  };

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
