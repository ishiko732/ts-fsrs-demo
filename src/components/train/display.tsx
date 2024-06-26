'use client';

import { useTrainContext } from '@/context/TrainContext';
import { useState } from 'react';
import { Button } from '../ui/button';

export default function TrainDisplay() {
  const { loading, loadTime, trainTime, totalTime, w } = useTrainContext();
  const [ok, setOk] = useState(false);
  const handleClick = async () => {
    // copy w to chipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(JSON.stringify(w));
      setOk(true);
      setTimeout(() => {
        setOk(false);
      }, 1000);
    }
  };
  return (
    !loading &&
    loadTime &&
    trainTime && (
      <div className='flex justify-center pt-4 w-1/2'>
        <div className='flex flex-col gap-2'>
          <p className='leading-7 [&:not(:first-child)]:mt-6'>
            W: <span className='select-all text-sm'>{JSON.stringify(w)}</span>
          </p>
          <p className='leading-7 [&:not(:first-child)]:mt-6 flex justify-center items-center flex-col'>
            <Button onClick={handleClick}>Copy w</Button>
            {ok && <span className='px-4 label-text'>Copied!</span>}
          </p>
          <ul className='my-6 ml-6 list-disc [&>li]:mt-2'>
            <li>Load time: {loadTime}</li>
            <li>Train time: {trainTime}</li>
            <li>Total time: {totalTime}</li>
          </ul>
        </div>
      </div>
    )
  );
}
