'use client';
import { useTrainContext } from '@/context/TrainContext';
import { Input } from '../ui/input';
import { ControllerRenderProps } from 'react-hook-form';

export default function NextDayStartAt({
  field,
}: {
  field: ControllerRenderProps<
    {
      timezone: string;
      nextDayStart: number;
    },
    'nextDayStart'
  >;
}) {
  const { setNextDayStart } = useTrainContext();
  return (
    <Input
      className='w-[350px] my-4 inline-flex'
      {...field}
      type='number'
      step={1}
      min={0}
      max={23}
      aria-label='Next Day Start At'
      onChange={(e) => {
        setNextDayStart(+e.target.value);
      }}
    />
  );
}
