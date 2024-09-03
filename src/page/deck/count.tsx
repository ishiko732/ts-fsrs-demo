import { DeckCrud } from '@lib/reviews/deck/crud';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default async function DeckStatus({
  timezone,
  hourOffset,
  did,
}: {
  timezone: string;
  hourOffset: number;
  did: number;
}) {
  const total = await DeckCrud.total(did);
  const detail = await DeckCrud.detail(did, timezone, hourOffset);
  return (
    <>
      <div className='space-y-1'>
        <h4 className='text-sm font-medium leading-none'>Total Note</h4>
        <div className='flex h-5 items-center space-x-2 text-sm'>
          {Object.entries(total).map(([key, value], index) => {
            return (
              <>
                <div key={key}>
                  {key} {value}
                </div>
                {index === Object.keys(total).length - 1 ? null : (
                  <Separator orientation='vertical' />
                )}
              </>
            );
          })}
        </div>
      </div>
      <Separator className='my-4' />
      <div className='space-y-1'>
        <h4 className='text-sm font-medium leading-none'>Current Plan</h4>
        <div className='flex h-5 items-center space-x-4 text-sm'>
          {Object.entries(detail).map(([key, value], index) => {
            return (
              <>
                <div key={key}>
                  {key} {value}
                </div>
                {index === Object.keys(detail).length - 1 ? null : (
                  <Separator orientation='vertical' />
                )}
              </>
            );
          })}
        </div>
      </div>
    </>
  );
}
