import { createEmptyCard } from "ts-fsrs";
import { Card,State} from "@prisma/client";

export function createEmptyCardByPrisma(): Partial<Card> {
    const card = createEmptyCard();

    return {
        ...card,
        state: State.New
    };
  }
