'use client';
import { DeckAppsAtom } from '@/atom/decks/apps';
import { Deck } from '@prisma/client';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

export const InstallApp = ({
  deck,
  className,
}: {
  deck: Deck;
  className?: string;
}) => {
  const deckApps = useAtomValue(DeckAppsAtom);
  const setDeckId = useSetAtom(deckApps.deckId);
  const setOpen = useSetAtom(deckApps.openInstall);
  const setInstalledApps = useSetAtom(deckApps.apps);

  const handler = useCallback(() => {
    const extend = JSON.parse(deck.extends as string) as Record<string, object>;
    const map = new Map<string, object>();
    for (const key in Object.keys(extend)) {
      map.set(key, extend[key]);
    }
    setDeckId(deck.did);
    setOpen(true);
    setInstalledApps(map);
  }, [deck.did, deck.extends, setDeckId, setInstalledApps, setOpen]);

  return deck.did ? (
    <DropdownMenuItem onClick={handler} className={className}>
      <div>Install App</div>
    </DropdownMenuItem>
  ) : null;
};
