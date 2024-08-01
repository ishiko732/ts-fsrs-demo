import { Deck } from '@prisma/client';
import { MoreHorizontal } from 'lucide-react';

const actions = (deck: Deck) => {
  return [
    {
      name: 'Edit Deck',
    },
    {
      name: 'View Note',
    },
    {
      name: 'Delete Deck',
    },
    // { TODO: Implement this
    //   name: 'Install App',
    // },
  ];
};

export default async function DeckActions({ deck }: { deck: Deck }) {
  return (
    <>
      <div className='ml-auto text-xs text-foreground  cursor-pointer'>
        <MoreHorizontal className='h-5 w-5' />
      </div>
    </>
  );
}
