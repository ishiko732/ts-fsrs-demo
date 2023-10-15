import { createEmptyCard } from "ts-fsrs";
import { Card, State } from "@prisma/client";


interface CardPrismaUnChecked extends Omit<Card, "cid" | "nid" | "last_review"> {
    cid?: number;
    nid?: number;
    last_review?: Date;
}

export function createEmptyCardByPrisma(): CardPrismaUnChecked {
    const card = createEmptyCard();

    return {
        ...card,
        state: State.New,
        last_review:undefined
    };
}
