import { createEmptyCard } from "ts-fsrs";

import { cardAfterHandler,CardPrismaUnChecked } from "./handler";

export function createEmptyCardByPrisma(): CardPrismaUnChecked {
  return createEmptyCard(new Date(), cardAfterHandler);
}
