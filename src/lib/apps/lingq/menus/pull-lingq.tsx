'use client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { LingqService } from '..';
import { TAppMenus } from '../types';

export function PullLingqsData({ deck, params, className }: TAppMenus) {
  const handler = async () => {
    new LingqService().pull(deck.did, params);
  };

  return deck.did && params ? (
    <DropdownMenuItem onClick={handler} className={className}>
      <div>Pull Lingqs</div>
    </DropdownMenuItem>
  ) : null;
}
