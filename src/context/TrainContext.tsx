"use client";

import { get_custom_timezone, get_timezone_offset } from "@/lib/date";
import { createContext, useContext, useState } from "react";

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
  computerMinuteOffset: (timezone: string, nextDayStart: number) => number;
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

  const computerMinuteOffset = (timezone: string, nextDayStart: number) => {
    const offset = get_timezone_offset(timezone) * -1;
    const nextDayStartOffset = nextDayStart * 60;
    const minute_offset = offset - nextDayStartOffset;
    return minute_offset;
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
    computerMinuteOffset,
  };
  return (
    <TrainContext.Provider value={value}>{children}</TrainContext.Provider>
  );
}
