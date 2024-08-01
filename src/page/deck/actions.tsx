import { Deck } from '@prisma/client';
import { MoreHorizontal } from 'lucide-react';
import { EditDeckProfile } from './actions/edit-deck';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@radix-ui/react-dropdown-menu';
import { DeleteDeck } from './actions/delete-deck';

const actions = [
  {
    name: 'Edit Deck',
    Action: EditDeckProfile,
  },
  // {
  //   name: 'View Note',
  // },
  {
    name: 'Delete Deck',
    Action: DeleteDeck,
  },
  // { TODO: Implement this
  //   name: 'Install App',
  // },
];

export default async function DeckActions({ deck }: { deck: Deck }) {
  return (
    <>
      <div className='ml-auto cursor-pointer'>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal className='h-5 w-5' />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-white dark:bg-black py-4 rounded-md'>
            {actions.map((action) => (
              <action.Action
                key={action.name}
                deck={deck}
                className=' transition-all hover:bg-accent m-0.5 px-1'
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
