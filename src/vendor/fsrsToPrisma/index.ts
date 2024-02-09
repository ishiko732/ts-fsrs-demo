import { createEmptyCard } from "ts-fsrs";
import { CardPrismaUnChecked, cardAfterHandler } from "./handler";

export function createEmptyCardByPrisma(): CardPrismaUnChecked {
  return createEmptyCard(new Date(), cardAfterHandler);
}
