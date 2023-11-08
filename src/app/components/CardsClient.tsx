"use client";
import { Note, Card } from "@prisma/client";
import React from "react";
import QACard from "./QACard";
import { CardProvider } from "../context/CardContext";
import ShowAnswerButton from "./ShowAnswerButton";
import StatusBar from "./StatusBar";

export default function CardClient({
  noteBox,
}: {
  noteBox: Array<Array<Note & { card: Card }>>;
}) {
  return (
    <CardProvider noteBox={noteBox}>
      <QACard />
      <div className="divider"></div>
      <StatusBar />
      <ShowAnswerButton />
    </CardProvider>
  );
}
