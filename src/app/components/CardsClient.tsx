"use client";
import { Note, Card } from "@prisma/client";
import React, { useEffect, useState } from "react";
import QACard from "./QACard";
import { CardProvider } from "../context/CardContext";
import ShowAnswerButton from "./ShowAnswerButton";

export default function CardClient({
  noteBox,
}: {
  noteBox: Array<Array<Note & { card: Card }>>;
}) {
  const [NewCard, LearningCard, RelearningCard, ReviewCard] = noteBox;
  
  return (
    <CardProvider noteBox={noteBox}>
      <QACard />
      <div className="divider"></div>
      <div className="flex justify-center text-white">
        <div className="badge badge-info gap-2 m-1  text-white">{NewCard.length}</div>
        <div className="badge badge-error gap-2 m-1  text-white">
          {LearningCard.length + RelearningCard.length}
        </div>
        <div className="badge badge-success gap-2 m-1  text-white">
          {ReviewCard.length}
        </div>
      </div>
      <ShowAnswerButton/>
    </CardProvider>
  );
}
