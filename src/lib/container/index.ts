import { CardCrud } from '@lib/reviews/card/crud';
import { DeckCrud } from '@lib/reviews/deck/crud';
import { NoteCrud } from '@lib/reviews/note/crud';
import { RevlogCrud } from '@lib/reviews/revlog/crud';

export const deckCrud = new DeckCrud();
export const noteCrud = new NoteCrud();
export const cardCrud = new CardCrud();
export const revlogCrud = new RevlogCrud();