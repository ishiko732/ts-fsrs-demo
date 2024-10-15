'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CurrentStateAtom, ReviewBarAtom } from '@/atom/decks/review';
import { State as PrismaState } from '@prisma/client';
import { useAtomValue } from 'jotai';
import { cn } from '@lib/utils';

export default function StatusBar() {
  const newSize = useAtomValue(ReviewBarAtom.New);
  const learningSize =
    useAtomValue(ReviewBarAtom.Learning) +
    useAtomValue(ReviewBarAtom.Relearning);
  const reviewSize = useAtomValue(ReviewBarAtom.Review);
  const currentType = useAtomValue(CurrentStateAtom);

  // const setCurrentType = useSetAtom(CurrentTypeAtom);
  // const setNewSize = useSetAtom(ReviewBarAtom.New);

  const datum = {
    [PrismaState.New]: {
      size: newSize,
      color: 'bg-blue-500',
    },
    [PrismaState.Learning]: {
      size: learningSize,
      color: 'bg-red-500',
    },
    [PrismaState.Review]: {
      size: reviewSize,
      color: 'bg-green-500',
    },
  };
  const key = [PrismaState.New, PrismaState.Learning, PrismaState.Review];

  return (
    <div className='flex justify-center text-white flex-1'>
      {key.map((key) => {
        const data = datum[key];
        return (
          <Badge
            className={cn(
              'h-8 my-2 gap-2 mr-2 dark:text-white',
              data.color,
              `hover:${data.color}`
            )}
            key={key}
          >
            {currentType === key ? (
              <span className='underline underline-offset-2'>{data.size}</span>
            ) : (
              data.size
            )}
          </Badge>
        );
      })}
    </div>
  );
}
