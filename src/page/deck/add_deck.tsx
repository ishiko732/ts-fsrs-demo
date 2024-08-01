'use client';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@lib/utils';
import { CirclePlus } from 'lucide-react';
import DeckDialog from './dialog';
import { useAtom } from 'jotai';
import {
  fuzz as fuzzAtom,
  shortTerm as shortTemAtom,
  openProfile,
} from '@/atom/decks/profile';

export default function AddDeckItem() {
  const [fuzz, setFuzz] = useAtom(fuzzAtom);
  const [shortTerm, setShortTerm] = useAtom(shortTemAtom);
  const [open, setOpen] = useAtom(openProfile);
  return (
    <>
      <div
        className={cn(
          'flex flex-col rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent w-full sm:w-[calc(50%-2rem)] md:w-[calc(33.33%-2rem)] m-2'
        )}
      >
        <div className='flex w-full flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className='font-semibold'>{'Add deck'}</span>
            <Badge>{shortTerm ? 'Short-term' : 'Long-term'}</Badge>
            <span
              className={cn(
                'flex h-2 w-2 rounded-full',
                fuzz ? 'bg-blue-600' : 'bg-red-600'
              )}
            />
          </div>
          <div className='flex justify-between pt-2'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='enable_fuzz'
                  checked={fuzz}
                  onCheckedChange={(checked) => setFuzz(checked)}
                />
                <Label htmlFor='enable_fuzz'>Fuzz</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='enable_short_term'
                  checked={shortTerm}
                  onCheckedChange={(checked) => setShortTerm(checked)}
                />
                <Label htmlFor='enable_short_term'>Short Schduler</Label>
              </div>
            </div>

            <div
              className='ml-auto text-xs text-foreground pr-4 pt-2 cursor-pointer'
              onClick={() => {
                setOpen(!open);
              }}
            >
              <CirclePlus size={32} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
