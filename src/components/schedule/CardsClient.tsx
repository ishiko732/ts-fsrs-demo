import { Note, Card } from "@prisma/client";
import React from "react";
import {QACard} from "@/components/source";
import { CardProvider } from "@/context/CardContext";
import ShowAnswerButton from "./ShowAnswerButton";
import StatusBar from "./StatusBar";
import RollbackButton from "./rollbackButton";
import DSRDisplay from "./DSR";

export default function CardClient({
  noteBox,
}: {
  noteBox: Array<Array<Note & { card: Card }>>;
}) {
  return (
    <CardProvider noteBox0={noteBox}>
      <QACard />
      <div className="divider"></div>
      <StatusBar />
      <ShowAnswerButton />
      <DSRDisplay/>
      <RollbackButton />
    </CardProvider>
  );
}
