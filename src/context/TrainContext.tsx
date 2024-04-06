"use client";

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
  };
  return (
    <TrainContext.Provider value={value}>{children}</TrainContext.Provider>
  );
}
