import { createEmptyCard,Card as FSRSCard} from "ts-fsrs";
import { Card, State } from "@prisma/client";
import { fixState } from "ts-fsrs/dist/help";


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

export function transferPrismaCardToCard(card: Card): FSRSCard {
    const state = fixState(card.state)
    return {
        state: state,
        last_review: card.last_review || undefined,
        due: card.due,
        stability: card.stability,
        difficulty: card.difficulty,
        elapsed_days: card.elapsed_days,
        scheduled_days: card.scheduled_days,
        reps: card.reps,
        lapses: card.lapses,
    } as FSRSCard;
}

// export function statePrismaToFSRSState(prisma:State):fsrsState{
//     return fsrsState[prisma as keyof typeof fsrsState]
// }