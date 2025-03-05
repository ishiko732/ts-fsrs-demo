'use client';
import React from 'react';
import { State } from 'ts-fsrs';

import { useCardContext } from '@/context/CardContext';

import { Badge } from '../ui/badge';

export default function StatusBar() {
  const { noteBox, currentType } = useCardContext();

  return (
    <div className='flex justify-center text-white flex-1'>
      <Badge className='bg-blue-500 hover:bg-blue-500 h-8 my-2 gap-2 mr-2 dark:text-white'>
        {currentType === State.New ? (
          <span className='underline underline-offset-2'>
            {noteBox[State.New].length}
          </span>
        ) : (
          noteBox[State.New].length
        )}
      </Badge>
      <Badge className='bg-red-500 hover:bg-red-500 h-8 my-2 gap-2 mr-2 dark:text-white'>
        {currentType === State.Learning ? (
          <span className='underline underline-offset-4'>
            {noteBox[State.Learning].length}
          </span>
        ) : (
          noteBox[State.Learning].length
        )}
      </Badge>
      <Badge className=' bg-green-500  hover:bg-green-500  h-8 my-2 gap-2 mr-2 dark:text-white'>
        {currentType === State.Review ? (
          <span className='underline underline-offset-4'>
            {noteBox[State.Review].length}
          </span>
        ) : (
          noteBox[State.Review].length
        )}
      </Badge>
    </div>
  );
}
