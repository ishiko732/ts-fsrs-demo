import { createEmptyCard,Card as FSRSCard,State as FSRSState,Rating as FSRSRating, fixState} 
    from "ts-fsrs";
import { Card, Rating, State } from "@prisma/client";


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

export function stateFSRSStateToPrisma(state:FSRSState):State{
    const stateMap: {[key: number]: State} = {
        0: State.New,
        1: State.Learning,
        2: State.Review,
        3: State.Relearning
    };
    return stateMap[state];
}

export function stateFSRSRatingToPrisma(rating:FSRSRating):Rating{
    const ratingMap: {[key: number]: Rating} = {
        0:Rating.Manual,
        1:Rating.Again,
        2:Rating.Hard,
        3:Rating.Good,
        4:Rating.Easy
    };
    return ratingMap[rating];
}