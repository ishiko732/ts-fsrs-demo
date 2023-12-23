import React from "react";
import { Card, Revlog } from "@prisma/client";
import { fsrs } from "ts-fsrs";
import { transferPrismaCardToCard } from "@/vendor/fsrsToPrisma";
import getFormattedDate from "@/lib/format";
import Forget from "./Forget";
type Props = {
  card: Card;
};

export default async function FSRSMsg({ card }: Props) {
  const f = fsrs();
  const retrievability = f.get_retrievability(
    transferPrismaCardToCard(card),
    new Date()
  );
  return (
    <>
      <h2 className="flex justify-center text-lg">FSRS</h2>
      <div className="text-sm opacity-60">Current State:{card.state}</div>
      <div className="text-sm opacity-60">
        Next Review:{getFormattedDate(card.due)}
      </div>
      <div className="text-sm opacity-60">reps:{card.reps}</div>
      <div className="text-sm opacity-60"> lapses:{card.lapses}</div>
      {card.last_review && (
        <div className="text-sm opacity-60">
          {" "}
          Last Review:{getFormattedDate(card.last_review)}
        </div>
      )}
      {retrievability && (
        <div className="text-sm opacity-60">
          <div>D:{card.difficulty.toFixed(2)}</div>
          <div>S:{card.stability.toFixed(2)}</div>
          <div>R:{retrievability}</div>
        </div>
      )}
      <Forget cid={card.cid} className="mt-4" />
    </>
  );
}
