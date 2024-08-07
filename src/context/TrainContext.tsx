"use client";

import { get_custom_timezone } from "@/lib/date";
import { getProgress } from "fsrs-browser";
import { createContext, useContext, useRef, useState } from "react";

type TrainContextProps = {
  w: number[];
  setW: React.Dispatch<React.SetStateAction<number[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  trainTime: string;
  setTrainTime: React.Dispatch<React.SetStateAction<string>>;
  loadTime: string;
  setLoadTime: React.Dispatch<React.SetStateAction<string>>;
  totalTime: string;
  setTotalTime: React.Dispatch<React.SetStateAction<string>>;
  timezone: string;
  setTimezone: React.Dispatch<React.SetStateAction<string>>;
  nextDayStart: number;
  setNextDayStart: React.Dispatch<React.SetStateAction<number>>;
  progressValue: number;
  setProgressValue: React.Dispatch<React.SetStateAction<number>>;
  progressTextRef: React.MutableRefObject<HTMLDivElement | null>;
  handleProgress: (wasmMemoryBuffer: ArrayBuffer, pointer: number) => void;
};

const TrainContext = createContext<TrainContextProps | undefined>(undefined);

export function useTrainContext() {
  const context = useContext(TrainContext);
  if (context === undefined) {
    throw new Error("TrainContext must be used within TrainContextProps");
  }
  return context;
}

export default function TrainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [w, setW] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainTime, setTrainTime] = useState("");
  const [loadTime, setLoadTime] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [timezone, setTimezone] = useState(get_custom_timezone()); // if UTC then timeoffset=0
  const [nextDayStart, setNextDayStart] = useState(4); // 4 hr
  const [progressValue, setProgressValue] = useState(0);
  const progressTextRef = useRef<HTMLDivElement>(null);

  const handleProgress = (wasmMemoryBuffer: ArrayBuffer, pointer: number) => {
    const { itemsProcessed, itemsTotal } = getProgress(
      wasmMemoryBuffer,
      pointer
    );
    setProgressValue((itemsProcessed / itemsTotal) * 100);
    if (progressTextRef.current) {
      progressTextRef.current.innerText = `${itemsProcessed}/${itemsTotal}`;
    }
    console.log(itemsProcessed, itemsTotal);
  };
  
  const value = {
    w,
    setW,
    loading,
    setLoading,
    trainTime,
    setTrainTime,
    loadTime,
    setLoadTime,
    totalTime,
    setTotalTime,
    timezone,
    setTimezone,
    nextDayStart,
    setNextDayStart,
    progressValue,
    setProgressValue,
    progressTextRef,
    handleProgress
  };
  return (
    <TrainContext.Provider value={value}>{children}</TrainContext.Provider>
  );
}
