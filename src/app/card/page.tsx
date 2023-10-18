import { getNotes } from "@/lib/note";
import { Card, Note, State } from "@prisma/client";
import React from "react";
import CardClient from "../components/CardsClient";

export const getData = async (due: Date): Promise<Array<Array<Note & { card: Card}>>> => {
    const states = [State.New, State.Learning, State.Relearning, State.Review];
    const noteBox = states.map((state) =>
        getNotes({
            take: state === State.New ? 50 : undefined,
            query: {
                card: {
                    state,
                    due: state === State.Review ? { lte: due } : undefined,
                },
            },
            order:
                state === State.Review ? { card: { last_review: "desc" } } : undefined,

        })
    );

    return Promise.all(noteBox);
};


export default async function Page() {
  const noteBox = await getData(new Date());

  return (
    <>
      <div>Use client:</div>
      <CardClient noteBox={noteBox}/>
    </>
  );
}
