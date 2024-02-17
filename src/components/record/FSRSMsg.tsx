import React from "react";
import { Card } from "@prisma/client";
import { fsrs } from "ts-fsrs";
import DateItem from "@/lib/formatDate";
import Forget from "./Forget";
import Suspended from "./Suspended";
type Props = {
  card: Card;
};

export default async function FSRSMsg({ card }: Props) {
  const f = fsrs();
  const retrievability = f.get_retrievability(
    card,
    new Date()
  );
  return (
    <>
      <h2 className="flex justify-center text-lg">FSRS</h2>
      <div className="text-sm opacity-60">Current State:{card.state}</div>
      <div className="text-sm opacity-60">
        Next Review:
        <DateItem date={card.due}></DateItem>
      </div>
      <div className="text-sm opacity-60">reps:{card.reps}</div>
      <div className="text-sm opacity-60"> lapses:{card.lapses}</div>
      {card.last_review && (
        <div className="text-sm opacity-60">
          Last Review:
          <DateItem date={card.last_review}></DateItem>
        </div>
      )}
      {retrievability && (
        <div className="text-sm opacity-60">
          <div>D:{card.difficulty.toFixed(2)}</div>
          <div>S:{card.stability.toFixed(2)}</div>
          <div>R:{retrievability}</div>
        </div>
      )}
        <div className="text-sm opacity-60">
          {`${`Suspended:${card.suspended}`}`}
        </div>
        <div className="mt-4 flex ">
          <Forget cid={card.cid} />
          <Suspended cid={card.cid} suspend={card.suspended} className="ml-4"/>
        </div>
    </>
  );
}
