import { Deck } from '@prisma/client';
import { MoreHorizontal } from 'lucide-react';
import { EditDeckProfile } from './actions/edit-deck';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@radix-ui/react-dropdown-menu';
import { DeleteDeck } from './actions/delete-deck';
import { RestoreDeck } from './actions/restore-deck';
import { ViewNote } from './actions/view-note';

const actions = [
  {
    name: 'Edit Deck',
    Action: EditDeckProfile,
  },
  {
    name: 'View Note',
    Action: ViewNote,
  },
  {
    name: 'Delete Deck',
    Action: DeleteDeck,
  },
  {
    name: 'Restore Deck',
    Action: RestoreDeck,
  },
  // { TODO: Implement this
  //   name: 'Install App',
  // },
];

export default async function DeckActions({ deck }: { deck: Deck }) {
  return (
    <div className='ml-auto cursor-pointer'>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreHorizontal className='h-5 w-5' />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='bg-white dark:bg-black py-4 rounded-md'
          align='end'
        >
          {actions.map((action) => (
            <action.Action
              key={action.name}
              deck={deck}
              className=' transition-all hover:bg-accent m-0.5 px-1 text-base'
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
