'use client';
import { useTrainContext } from '@/context/TrainContext';
import { Progress } from '../ui/progress';

export default function TrainProgress() {
  const { progressValue, progressTextRef } = useTrainContext();
  return (
    progressValue > 0 && (
      <>
        <Progress className='w-[400px] my-4' value={progressValue} />
        <div ref={progressTextRef}></div>
      </>
    )
  );
}
