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
    <div className="flex justify-center flex-col mx-auto text-sm text-left items-center">
        <p className="w-80">Current State:{card.state}</p>
        <p className="w-80">
          Next Review:
          <DateItem date={card.due}></DateItem>
        </p>
        {card.last_review && (
          <p className="w-80">
            Last Review:
            <DateItem date={card.last_review}></DateItem>
          </p>
        )}
        <p className="w-80">elapsed:{card.elapsed_days}days</p>
        <p className="w-80">scheduled:{card.scheduled_days}days</p>
        <p className="w-80">reps:{card.reps}</p>
        <p className="w-80">lapses:{card.lapses}</p>
        <p className="w-80">
          {`Suspended:${card.suspended}`}
        </p>
        {retrievability && (
          <div>
            <div>D:{card.difficulty.toFixed(2)}</div>
            <div>S:{card.stability.toFixed(2)}</div>
            <div>R:{retrievability}</div>
          </div>
        )}
      <div className="mt-4 flex py-4">
        <Forget cid={card.cid} />
        <Suspended cid={card.cid} suspend={card.suspended} className="ml-2" />
      </div>
    </div>
  );
}
