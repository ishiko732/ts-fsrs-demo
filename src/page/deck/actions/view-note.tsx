import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import type { Deck } from '@prisma/client';
import Link from 'next/link';

export const ViewNote = ({
  deck,
  className,
}: {
  deck: Deck;
  className?: string;
}) => {
  return (
    <>
      <DropdownMenuItem className={className} asChild>
        <Link href={`/deck/${deck.did}/note`} >View Note</Link>
      </DropdownMenuItem>
    </>
  );
};
