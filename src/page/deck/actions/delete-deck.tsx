'use client';

import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import type { Deck } from '@prisma/client';
import { useCallback } from 'react';
import { deckCrud } from '@lib/container';

export const DeleteDeck = ({
  deck,
  className,
}: {
  deck: Deck;
  className?: string;
}) => {
  const handler = useCallback(async () => {
    await deckCrud.delete(deck.did, true);
  }, [deck]);

  return !deck.deleted&&deck.did ? (
    <DropdownMenuItem onClick={handler} className={className}>
      <div>Delete Deck</div>
    </DropdownMenuItem>
  ) : null;
};
