'use client';

import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import type { Deck } from '@prisma/client';
import { useCallback } from 'react';
import { deckCrud } from '@lib/container';

export const RestoreDeck = ({
  deck,
  className,
}: {
  deck: Deck;
  className?: string;
}) => {
  const handler = useCallback(async () => {
    await deckCrud.restore(deck.did);
  }, [deck]);

  return deck.deleted ? (
    <DropdownMenuItem onClick={handler} className={className}>
      <div>Restore Deck</div>
    </DropdownMenuItem>
  ) : null;
};
