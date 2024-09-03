'use client';
import {
  currentCardId,
  CurrentStateAtom,
  DisplayAnswer,
  DisplayDSR,
} from '@/atom/decks/review';
import { State } from '@prisma/client';
import { useAtomValue } from 'jotai';

export default function DSRDisplay() {
  const cid = useAtomValue(currentCardId);
  const open = useAtomValue(DisplayAnswer);
  const currentType = useAtomValue(CurrentStateAtom);
  const DSR = useAtomValue(DisplayDSR);

  return DSR.R && !open && currentType === State.Review ? (
    <div className='flex justify-center opacity-15 flex-col text-left mx-auto'>
      <div>{`D : ${DSR.D.toFixed(2)}`}</div>
      <div>{`S : ${DSR.S.toFixed(0)} Days`}</div>
      <div>{`R : ${DSR.R}`}</div>
    </div>
  ) : null;
}
