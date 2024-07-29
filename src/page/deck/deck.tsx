import { Badge } from '@/components/ui/badge';
import { cn } from '@lib/utils';
import { Deck } from '@prisma/client';
import type { FSRSParameters } from 'ts-fsrs';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import DeckStatus from './count';

export default function DeckItem({
  deck,
  timezone,
  hourOffset,
}: {
  deck: Deck;
  timezone: string;
  hourOffset: number;
}) {
  const f: FSRSParameters = JSON.parse(deck.fsrs as string);
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent w-full sm:w-[calc(50%-2rem)] md:w-[calc(33.33%-2rem)] m-2'
      )}
    >
      <div className='flex w-full flex-col gap-1'>
        <div className='flex items-center'>
          <div className='flex items-center gap-2'>
            <span className='font-semibold'>{deck.name}</span>
            <Badge>{f.enable_short_term ? 'Short-term' : 'Long-term'}</Badge>
            <span
              className={cn(
                'flex h-2 w-2 rounded-full',
                f.enable_fuzz ? 'bg-blue-600' : 'bg-red-600'
              )}
            />
          </div>
          <div className='ml-auto text-xs text-foreground'>{`#${deck.did}`}</div>
        </div>
      </div>
      <Suspense fallback={<Skeleton className='h-16 w-full space-y-2' />}>
        <DeckStatus
          did={deck.did}
          timezone={timezone}
          hourOffset={hourOffset}
        />
      </Suspense>
    </div>
  );
}
