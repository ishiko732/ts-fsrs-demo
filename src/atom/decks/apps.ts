import { Atom, atom } from 'jotai';

export type TDeckApps = {
  deckId: Atom<number>;
  openInstall: Atom<boolean>;
  apps: Atom<Map<string, object>>;
};

export const DeckAppsAtom = atom({
  deckId: atom(0),
  openInstall: atom(false),
  apps: atom(new Map<string, object>()),
} satisfies TDeckApps);
