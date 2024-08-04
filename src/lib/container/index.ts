import { DeckService } from '@lib/deck';
import { DeckCrud } from '@lib/deck/crud';

export const deckCrud = new DeckCrud();
export const deckContext = new DeckService();
