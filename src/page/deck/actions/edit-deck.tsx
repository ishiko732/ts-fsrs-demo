'use client';
import { DeckProfileAtom } from '@/atom/decks/profile';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import type { Deck } from '@prisma/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { use, useCallback } from 'react';
import { FSRSParameters } from 'ts-fsrs';

export const EditDeckProfile = ({
  deck,
  className,
}: {
  deck: Deck;
  className?: string;
}) => {
  const deckProfile = useAtomValue(DeckProfileAtom);
  const setProfile = useSetAtom(deckProfile.profile);
  const setOpen = useSetAtom(deckProfile.openProfile);

  const handler = useCallback(() => {
    const fsrs = JSON.parse(deck.fsrs as string) as FSRSParameters;
    setProfile({
      name: deck.name,
      did: deck.did,
      card_limit: deck.card_limit,
      lapses: deck.lapses,
      fsrs,
    });
    setOpen(true);
  }, [deck, setProfile, setOpen]);

  return deck.did ? (
    <DropdownMenuItem onClick={handler} className={className}>
      <div>Edit Deck</div>
    </DropdownMenuItem>
  ) : null;
};
