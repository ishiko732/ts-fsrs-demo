'use client';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import TimezoneSelector from './timezones';
import NextDayStartAt from './nextDayStartAt';
import FileTrain from './file-train-button';
import { useForm } from 'react-hook-form';
import { useTrainContext } from '@/context/TrainContext';
// import OwnTrain from './own-train-button';
import dynamic from 'next/dynamic';

const NoSSR = dynamic(() => Promise.resolve(FSRSParamTrainForm), {
  ssr: false,
});

export default NoSSR;

function FSRSParamTrainForm({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { timezone, nextDayStart } = useTrainContext();
  const form = useForm({
    mode: 'onSubmit',
    values: {
      timezone,
      nextDayStart,
    },
  });
  return (
    <Form {...form}>
      <form className='space-y-4 w-1/2 flex justify-center flex-col flex-1' suppressHydrationWarning>
        <FormField
          control={form.control}
          name='timezone'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='pr-4'>Timezone</FormLabel>
              <FormControl>
                <TimezoneSelector />
              </FormControl>
              <FormDescription>
                The timezone of the user. The default timezone is the browser
                timezone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='nextDayStart'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='pr-4' htmlFor='Next Day Start At'>
                Next Day Start At
              </FormLabel>
              <FormControl>
                <NextDayStartAt field={field} />
              </FormControl>
              <FormDescription>
                The time of the day that the next day starts at. The default is
                4.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex flex-1 justify-between items-stretch'>
          <div className='inline-flex justify-center items-center'>
            <label htmlFor='File Train'>using .csv train：</label>
            <FileTrain form={form} />
          </div>
          <div>
            <label>using your own revlog：</label>
            {/* <OwnTrain form={form} /> */}
          </div>
        </div>

        {children}
      </form>
    </Form>
  );
}
