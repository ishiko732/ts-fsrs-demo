'use client';

import NoteHelper from './NoteHelper';
import PreviewButton from './PreviewBtn';
import StatusBar from './StatusBar';

export const ReviewContainer = () => {
  return (
    <div className='container'>
      <NoteHelper />
      <StatusBar />
      <PreviewButton />
    </div>
  );
};
