import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import type { Deck } from '@prisma/client';
import Link from 'next/link';

export const StartReview = ({
  deck,
  className,
}: {
  deck: Deck;
  className?: string;
}) => {
  return (
    <>
      <DropdownMenuItem className={className} asChild>
        <div>
        <Link href={`/deck/${deck.did}/card`} >Start Review</Link>
        </div>
      </DropdownMenuItem>
    </>
  );
};
