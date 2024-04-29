"use client";
import { useTrainContext } from "@/context/TrainContext";

export default function TrainTestButton() {
  const { loading } = useTrainContext();
  return (
    <button
      className="btn mt-4"
      onClick={() => {
        console.log("UI thread is not blocked.");
        // alert("UI thread is not blocked.");
      }}
    >
      UI thread TEST
      {loading ? <span className="loading loading-spinner"></span> : null}
    </button>
  );
}
