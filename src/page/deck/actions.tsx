import { Deck } from '@prisma/client';
import { MoreHorizontal } from 'lucide-react';
import { EditDeckProfile } from './actions/edit-deck';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@radix-ui/react-dropdown-menu';

const actions = [
  {
    name: 'Edit Deck',
    Action: EditDeckProfile,
  },
  // {
  //   name: 'View Note',
  // },
  // {
  //   name: 'Delete Deck',
  // },
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
          <DropdownMenuContent>
            {actions.map((action, index) => (
              <action.Action key={action.name} deck={deck} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
