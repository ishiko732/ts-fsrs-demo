'use client';

import { get_custom_timezone, get_timezones } from '@/lib/date';
import { useState, useEffect } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '../ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrainContext } from '@/context/TrainContext';

export default function TimezoneSelector() {
  // https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  const { timezone, setTimezone } = useTrainContext();
  const [open, setOpen] = useState(false);
  const timezones = get_timezones() || [];
  const handlClick = (tz: string) => {
    setTimezone(tz);
    setOpen(false);
  };

  useEffect(() => {
    setIsClient(true);
    setTimezone(get_custom_timezone());
  }, []);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-[400px] justify-between'
          >
            {timezone || 'Select TimeZone...'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[400px] p-0'>
          <Command>
            <CommandInput placeholder='Search TimeZone...' />
            {/* https://github.com/shadcn-ui/ui/issues/2944 */}
            <CommandList>
              <CommandEmpty>No Dataset</CommandEmpty>
              <CommandGroup>
                {isClient &&
                  timezones.map((tz, index) => (
                    <CommandItem key={index} value={tz} onSelect={handlClick}>
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          timezone === tz ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {tz}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
