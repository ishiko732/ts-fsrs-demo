
'use client'
import React from 'react'
import { useCardContext } from '../context/CardContext';
import { State } from 'ts-fsrs';

export default function StatusBar() {
    const { noteBox} = useCardContext();
  return (
    <div className="flex justify-center text-white">
    <div className="badge badge-info gap-2 m-1  text-white">
      {noteBox[State.New].length}
    </div>
    <div className="badge badge-error gap-2 m-1  text-white">
      {noteBox[State.Learning].length + noteBox[State.Relearning].length}
    </div>
    <div className="badge badge-success gap-2 m-1  text-white">
      {noteBox[State.Review].length}
    </div>
  </div>
  )
}
