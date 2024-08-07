'use client';
import { useEffect } from 'react';
import { z } from 'zod';
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
import {
  default_maximum_interval,
  default_request_retention,
  default_w,
  generatorParameters,
} from 'ts-fsrs';
import { DeckCrud } from '@lib/reviews/deck/crud';
import { useAtom, useAtomValue } from 'jotai';
import { DeckProfileAtom } from '@/atom/decks/profile';
import { CARDLIMT, LAPSES } from '@/constant/deck';
const formSchema = z.object({
  name: z.coerce.string(),
  request_retention: z.coerce
    .number()
    .min(0.7, { message: 'Value must be at least 0.7' })
    .max(0.99, { message: 'Value must be no more than 0.99' })
    .refine((val) => (val * 100) % 1 === 0, {
      message: 'Value must be a multiple of 0.01',
    })
    .refine(Number.isFinite, { message: 'Value must be a finite number' }),
  maximum_interval: z.coerce.number().min(7).max(36500).step(1).int(),
  w: z.string().default(JSON.stringify(default_w)),
  enable_fuzz: z.coerce.boolean(),
  enable_short_term: z.coerce.boolean(),
  card_limit: z.coerce.number().min(0).step(1).int().default(50),
  lapses: z.coerce.number().min(3).step(1).int().default(8),
});

export default function DeckForm({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const deckProfile = useAtomValue(DeckProfileAtom);
  const fuzz = useAtomValue(deckProfile.fuzz);
  const short_term = useAtomValue(deckProfile.shortTerm);
  const params = useAtomValue(deckProfile.profile);
  useEffect(() => {
    form.setValue('request_retention', params.fsrs.request_retention);
    form.setValue('maximum_interval', params.fsrs.maximum_interval);
    form.setValue('w', JSON.stringify(params.fsrs.w));
    form.setValue('card_limit', params.card_limit);
    form.setValue('lapses', params.lapses);
    if (params.did) {
      form.setValue('enable_fuzz', params.fsrs.enable_fuzz);
      form.setValue('enable_short_term', params.fsrs.enable_short_term);
      form.setValue('name', params.name);
    } else {
      form.setValue('enable_fuzz', fuzz);
      form.setValue('enable_short_term', short_term);
    }
  }, [form, fuzz, params, short_term]);

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
    const f_params = generatorParameters({
      request_retention: values.request_retention,
      maximum_interval: values.maximum_interval,
      w,
      enable_fuzz: values.enable_fuzz,
      enable_short_term: values.enable_short_term,
    });
    const curd = new DeckCrud();
    if(params.did){
      const res = await curd.update({
        did: params.did,
        name: values.name,
        fsrs: JSON.stringify(f_params),
        card_limit: values.card_limit,
        lapses: values.lapses,
        extends: JSON.stringify({}),
      });
    }else{
      const res = await curd.create({
        name: values.name,
        fsrs: JSON.stringify(f_params),
        card_limit: values.card_limit,
        lapses: values.lapses,
        extends: JSON.stringify({}),
      });
    }
    setLoading(false);
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deck Name</FormLabel>
              <FormControl>
                <Input
                  placeholder='please enter the deck name'
                  {...field}
                  type='text'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  defaultValue={field.value}
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
                <FormLabel className='space-y-0.5 pr-4'>
                  enable_short-term
                </FormLabel>
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
        <Button type='submit' className='hidden' id='deck_setting'>
          Submit
        </Button>
      </form>
    </Form>
  );
}
