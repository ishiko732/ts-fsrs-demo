"use client";

import { computeParameters, getProcessW } from "@/app/api/fsrs/train/train";
import { useTrainContext } from "@/context/TrainContext";
import { ExportRevLog } from "@/lib/log";
import { useEffect, useState } from "react";

export default function OwnTrainButton({
  action,
}: {
  action: () => Promise<ExportRevLog[]>;
}) {
  const [basePath, setBasePath] = useState("");
  const { loading, setLoading, setW, setLoadTime, setTrainTime, setTotalTime } =
    useTrainContext();
  useEffect(() => {
    setBasePath(window.location.origin);
  }, []);
  const handleClick = async () => {
    const wasmURL = new URL("fsrs_browser_bg.wasm", basePath);
    setLoading(true);
    const start = performance.now();
    const logs = await action();
    const loadEndTime = performance.now();
    const cids: bigint[] = [];
    const eases: number[] = [];
    const ids: bigint[] = [];
    const types: number[] = [];
    logs.forEach((log) => {
      cids.push(BigInt(log.card_id));
      ids.push(BigInt(log.review_time));
      eases.push(log.review_rating);
      types.push(log.review_state);
    });
    setLoadTime(`${(loadEndTime - start).toFixed(5)}ms`);
    const trainStartTime = performance.now();
    const w = await computeParameters(
      wasmURL,
      new BigInt64Array(cids),
      new Uint8Array(eases),
      new BigInt64Array(ids),
      new Uint8Array(types)
    );
    const endTime = performance.now();
    setTrainTime(`${(endTime - trainStartTime).toFixed(5)}ms`);
    setTotalTime(`${(endTime - start).toFixed(5)}ms`);
    setLoading(false);
    console.log(w);
    setW(getProcessW(w));
  };

  return (
    <>
      <button className="btn" disabled={loading} onClick={handleClick}>
        Train(by own Revlog)
      </button>
    </>
  );
}
