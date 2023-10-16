import { createEmptyCard } from "ts-fsrs";
import { Card, State } from "@prisma/client";


interface CardPrismaUnChecked extends Omit<Card, "cid" | "nid" | "last_review"|'state'> {
    cid?: number;
    nid?: number;
    last_review?: Date;
    state: State;
}

export function createEmptyCardByPrisma(): CardPrismaUnChecked {
    const card = createEmptyCard();
    return {
        ...card,
        state: State.New,
        last_review:undefined
    };
}

// export function statePrismaToFSRSState(prisma:State):fsrsState{
//     return fsrsState[prisma as keyof typeof fsrsState]
// }