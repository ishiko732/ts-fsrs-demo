import { Deck } from '@prisma/client';
import { atom } from 'jotai';
import {
  default_enable_fuzz,
  default_w,
  defualt_enable_short_term,
  FSRSParameters,
} from 'ts-fsrs';

export type TDeckProfile = Omit<
  Deck,
  'deleted' | 'extends' | 'fsrs' | 'uid'
> & {
  fsrs: FSRSParameters;
};

export const DeckProfileAtom = atom({
  openProfile: atom(false),
  fuzz: atom(default_enable_fuzz),
  shortTerm: atom(defualt_enable_short_term),
  profile: atom({
    name: '',
    desc: '',
    did: 0,
    card_limit: 50,
    lapses: 8,
    fsrs: {
      request_retention: 0.9,
      maximum_interval: 365,
      w: default_w,
      enable_fuzz: default_enable_fuzz,
      enable_short_term: defualt_enable_short_term,
    } as FSRSParameters,
  } satisfies TDeckProfile),
});
