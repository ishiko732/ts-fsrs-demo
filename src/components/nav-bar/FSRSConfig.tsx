'use client';
import Link from 'next/link';
import { commitUserParams, getUserParams } from '@/actions/userParamsService';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { ParametersType } from '@/lib/fsrs';
import { z } from 'zod';
import LoadingSpinner from '../loadingSpinner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '../ui/badge';
const formSchema = z.object({
  request_retention: z.coerce
    .number()
    .min(0.7, { message: 'Value must be at least 0.7' })
    .max(0.99, { message: 'Value must be no more than 0.99' })
    .refine((val) => (val * 100) % 1 === 0, {
      message: 'Value must be a multiple of 0.01',
    })
    .refine(Number.isFinite, { message: 'Value must be a finite number' }),
  maximum_interval: z.coerce.number().min(7).max(36500).step(1).int(),
  w: z.string(),
  enable_fuzz: z.coerce.boolean(),
  enable_short_term: z.coerce.boolean(),
  card_limit: z.coerce.number().min(0).step(1).int(),
  lapses: z.coerce.number().min(3).step(1).int(),
  lingq_token: z.string().optional(),
});

export default function FSRSConfigForm({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [params, setParams] = useState<ParametersType>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  useEffect(() => {
    getUserParams()
      .then((res) => {
        if (res.code === 200 && res.data) {
          const param = res.data;
          form.setValue('request_retention', param.params.request_retention);
          form.setValue('maximum_interval', param.params.maximum_interval);
          form.setValue('w', param.params.w.join(','));
          form.setValue('enable_fuzz', param.params.enable_fuzz);
          form.setValue('card_limit', param.card_limit);
          form.setValue('lapses', param.lapses);
          form.setValue('lingq_token', param.lingq_token ?? undefined);
          form.setValue('enable_short_term', param.params.enable_short_term);
          setParams(param);
        } else {
          signOut();
        }
      })
      .catch((e) => {
        console.error(e);
        signOut();
      });
  }, [form]);
  if (!params) {
    return <LoadingSpinner />;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // process w
    const w = values.w
      .replace(/[\[\]]/g, '')
      .split(',')
      .map((v) => parseFloat(v));
    if (w.length !== 19) {
      form.setError('w', { message: 'w must have 19 values' });
      return;
    }
    if (loading) {
      return;
    }
    setLoading(true);
    const res = await commitUserParams({
      ...values,
      w,
      lingq_token: values.lingq_token ?? null,
    });
    setLoading(false);
    console.log(res);
    window.location.reload();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        method='post'
        className='space-y-4 max-h-[80%] overflow-y-auto pb-4 px-8'
      >
        <FormField
          control={form.control}
          name='request_retention'
          render={({ field }) => (
            <FormItem>
              <FormLabel>request_retention</FormLabel>
              <FormControl>
                <Input
                  placeholder='request_retention'
                  {...field}
                  type='number'
                />
              </FormControl>
              <FormDescription>
                Represents the probability of the target memory you want. Note
                that there is a trade-off between higher retention rates and
                higher repetition rates. It is recommended that you set this
                value between 0.8 and 0.9.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='maximum_interval'
          render={({ field }) => (
            <FormItem>
              <FormLabel>maximum_interval</FormLabel>
              <FormControl>
                <Input placeholder='maximum_interval' {...field} />
              </FormControl>
              <FormDescription>
                The maximum number of days between reviews of a card. When the
                review interval of a card reaches this number of days, the{' '}
                {`'hard', 'good', and 'easy'`} intervals will be consistent. The
                shorter the interval, the more workload.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='w'
          render={({ field }) => (
            <FormItem>
              <FormLabel>w</FormLabel>
              <FormControl>
                <Input placeholder='w' {...field} />
              </FormControl>
              <FormDescription>
                Weights created by running the FSRS optimizer. By default, these
                are calculated from a sample dataset.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='enable_fuzz'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center'>
                <FormLabel className='space-y-0.5 pr-4'>enable_fuzz</FormLabel>
                <FormControl>
                  <Switch
                    id='enable_fuzz'
                    placeholder='enable_fuzz'
                    {...field}
                    value={undefined}
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                </FormControl>
              </div>
              <FormDescription>
                When enabled, this adds a small random delay to the new interval
                time to prevent cards from sticking together and always being
                reviewed on the same day.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='enable_short_term'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center'>
                <FormLabel className='space-y-0.5 pr-4'>enable_short-term</FormLabel>
                <FormControl>
                  <Switch
                    id='enable_short-term'
                    placeholder='enable_short-term'
                    {...field}
                    value={undefined}
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                </FormControl>
              </div>
              <FormDescription>
                When disabled, this allow user to skip the short-term schedule.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='card_limit'
          render={({ field }) => (
            <FormItem>
              <FormLabel>card_limit</FormLabel>
              <FormControl>
                <Input
                  placeholder='card_limit'
                  {...field}
                  className='text-sm'
                />
              </FormControl>
              <FormDescription>
                Represents the maximum limit of new cards that can be learned
                today.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='lapses'
          render={({ field }) => (
            <FormItem>
              <FormLabel>lapses</FormLabel>
              <FormControl>
                <Input placeholder='lapses' {...field} />
              </FormControl>
              <FormDescription>
                The card will automatically pause after reaching that number of
                lapses.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='lingq_token'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                lingq_token
                <Badge variant='outline' className='ml-4'>
                  <Link
                    className='btn btn-xs'
                    target='_blank'
                    href={'https://www.lingq.com/accounts/apikey/'}
                  >
                    Get Key
                  </Link>
                </Badge>
              </FormLabel>
              <FormControl>
                <Input placeholder='lingq_token' {...field} />
              </FormControl>
              <FormDescription>
                Associate lingq’s card for FSRS scheduling.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='hidden' id='fsrsSetting'>
          Submit
        </Button>
      </form>
    </Form>
  );
}
