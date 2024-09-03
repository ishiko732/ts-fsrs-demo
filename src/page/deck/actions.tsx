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
import { InstallApp } from './actions/install-apps';
import { AppMenus } from '@lib/apps/menus';
import { getDeckNoteSizeAction } from '@actions/userDeckService';

const actions = [
  {
    name: 'Edit Deck',
    Action: EditDeckProfile,
  },
  {
    name: 'Delete Deck',
    Action: DeleteDeck,
  },
  {
    name: 'Restore Deck',
    Action: RestoreDeck,
  },
  {
    name: 'Install App',
    Action: InstallApp,
  },
  {
    name: '<hr>',
  },
];

export default async function DeckActions({ deck }: { deck: Deck }) {
  const extend = deck.extends as Record<string, object>;
  const extra_actions = [];
  const noteSize = await getDeckNoteSizeAction(deck.did)
  for (const app of AppMenus) {
    if (app.allow_service in extend || app.allow_service === 'Global Service') {
      const menus = app.menu;
      for (const menu of menus) {
        extra_actions.push({
          name: menu.name,
          Action: menu.action,
          service: app.allow_service,
          noteSize: noteSize,
        });
      }
    }
  }

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
          {actions.map((action) =>
            action.Action ? (
              <action.Action
                key={action.name}
                deck={deck}
                className=' transition-all hover:bg-accent m-0.5 px-1 text-base'
              />
            ) : (
              <hr
                key={action.name}
                className='border-t border-stone-500 dark:border-gray-600'
              />
            )
          )}
          {extra_actions.map((action) =>
            action.Action ? (
              <action.Action
                key={action.name}
                deck={deck}
                params={extend[action.service]}
                note_size={action.noteSize}
                className=' transition-all hover:bg-accent m-0.5 px-1 text-base'
              />
            ) : (
              <hr
                key={action.name}
                className='border-t border-stone-500 dark:border-gray-600'
              />
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
