import React from 'react';
import { Card } from '@prisma/client';
import { fsrs, S_MIN } from 'ts-fsrs';
import DateItem from '@/lib/formatDate';
import Forget from './Forget';
import Suspended from './Suspended';
type Props = {
  card: Card;
};

export default async function FSRSMsg({ card }: Props) {
  const f = fsrs();
  // fix: s=0 https://github.com/ishiko732/ts-fsrs-demo/issues/52
  card.stability = Math.max(S_MIN, card.stability);

  const retrievability = f.get_retrievability(card, new Date());
  return (
    <>
      <div className='flex justify-start flex-col text-sm text-left'>
        <p className='leading-7 [&:not(:first-child)]:mt-1'>
          Current State : {card.state}
        </p>
        <p className='leading-7 [&:not(:first-child)]:mt-1'>
          Next Review :<DateItem date={card.due}></DateItem>
        </p>
        {card.last_review && (
          <p className='leading-7 [&:not(:first-child)]:mt-1'>
            Last Review :<DateItem date={card.last_review}></DateItem>
          </p>
        )}
        <p className='leading-7 [&:not(:first-child)]:mt-1'>
          elapsed : {card.elapsed_days}days
        </p>
        <p className='leading-7 [&:not(:first-child)]:mt-1'>
          scheduled : {card.scheduled_days}days
        </p>
        <p className='leading-7 [&:not(:first-child)]:mt-1'>
          reps : {card.reps}
        </p>
        <p className='leading-7 [&:not(:first-child)]:mt-1'>
          lapses : {card.lapses}
        </p>
        <p className='leading-7 [&:not(:first-child)]:mt-1'>
          {`Suspended : ${String(card.suspended)}`}
        </p>
        {retrievability && (
          <div>
            <div>D:{card.difficulty.toFixed(2)}</div>
            <div>S:{card.stability.toFixed(2)}</div>
            <div>R:{retrievability}</div>
          </div>
        )}
        <div className='mt-2 flex py-4 justify-center items-center'>
          <Forget cid={card.cid} />
          <Suspended cid={card.cid} suspend={card.suspended} className='ml-2' />
        </div>
      </div>
    </>
  );
}
