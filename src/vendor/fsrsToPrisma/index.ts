import { createEmptyCard } from "ts-fsrs";

import { cardAfterHandler,type CardPrismaUnChecked } from "./handler";

export function createEmptyCardByPrisma(): CardPrismaUnChecked {
  return createEmptyCard(new Date(), cardAfterHandler);
}
