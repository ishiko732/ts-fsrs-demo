'use client';

import { useAtomValue } from 'jotai';
import NoteHelper from './NoteHelper';
import PreviewButton from './PreviewBtn';
import StatusBar from './StatusBar';
import { DisplayFinish } from '@/atom/decks/review';
import Finish from './Finish';

export const ReviewContainer = () => {
  const finished = useAtomValue(DisplayFinish);
  return (
    <div className='container'>
      {finished ? (
        <Finish />
      ) : (
        <>
          <NoteHelper />
          <StatusBar />
          <PreviewButton />
        </>
      )}
    </div>
  );
};
