'use client';

import { getProcessW } from '@/app/api/fsrs/train/train';
import { useTrainContext } from '@/context/TrainContext';
import { computerMinuteOffset, get_timezones } from '@/lib/date';
import { useEffect, useRef } from 'react';
import { Input } from '../ui/input';

import LoadingSpinner from '../loadingSpinner';
import { UseFormReturn } from 'react-hook-form';

const timezones = get_timezones();
// dataset: https://github.com/open-spaced-repetition/fsrs4anki/issues/450
export default function FileTrain({
  form,
}: {
  form: UseFormReturn<
    { timezone: string; nextDayStart: number },
    any,
    undefined
  >;
}) {
  const workerRef = useRef<Worker>();
  const timeIdRef = useRef<NodeJS.Timeout>();
  const {
    loading,
    setLoading,
    setW,
    setLoadTime,
    setTrainTime,
    setTotalTime,
    timezone,
    nextDayStart,
    handleProgress,
  } = useTrainContext();

  const handleClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    if (!!~timezones.indexOf(timezone) === false) {
      form.setError('timezone', { message: 'Invalid timezone' });
      return;
    }
    if (nextDayStart < 0 || nextDayStart > 24) {
      form.setError('nextDayStart', { message: 'Invalid next day start' });
      return;
    }
    setLoading(true);
    const file = e.target.files[0];
    const offset = computerMinuteOffset(timezone, nextDayStart);
    workerRef.current?.postMessage({ file, offset });
    if (e.target.value) {
      e.target.value = '';
    }
  };

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('./fsrs_worker.ts', import.meta.url)
    );
    workerRef.current.onmessage = (
      event: MessageEvent<TrainResult | ProgressState>
    ) => {
      console.log(event.data);
      if ('tag' in event.data) {
        // process ProgressState
        const progressState = event.data as ProgressState;
        if (progressState.tag === 'start') {
          const { wasmMemoryBuffer, pointer } = progressState;
          handleProgress(wasmMemoryBuffer, pointer);
          timeIdRef.current = setInterval(() => {
            handleProgress(wasmMemoryBuffer, pointer);
          }, 100);
        } else if (progressState.tag === 'finish') {
          clearInterval(timeIdRef.current);
          console.log('finish');
        }
      } else {
        // process TrainResult
        const trainResult = event.data as TrainResult;
        setW(getProcessW(trainResult.w));
        setLoadTime(trainResult.loadTime);
        setTrainTime(trainResult.trainTime);
        setTotalTime(trainResult.totalTime);
        setLoading(false);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Input
        disabled={loading}
        type='file'
        className='file-input w-full max-w-xs'
        onChange={(e) => handleClick(e)}
        accept='.csv'
        aria-label='File Train'
      />
      {loading && <LoadingSpinner />}
    </>
  );
}
