'use client';
import Link from 'next/link';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@radix-ui/react-hover-card';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { FSRSVersion } from 'ts-fsrs';
const Logo = ({ env }: { env: string }) => {
  return (
    <div className='mr-4 hidden sm:flex'>
      <div className='btn btn-ghost text-xl hidden sm:flex'>
        <Image src='/osr.png' alt='TS-FSRS-DEMO' width={32} height={32} />
        <HoverCard>
          <HoverCardTrigger className='hidden font-bold sm:inline-block mt-1 line-clamp-3 cursor-pointer '>
            TS-FSRS-DEMO
          </HoverCardTrigger>
          <HoverCardContent className='pt-4 pl-6 w-[24rem]  border   border-b-stone-900 dark:border-white'>
            <div className='flex justify-between space-x-4'>
              <Link href='https://github.com/ishiko732' target='_blank'>
                <Avatar>
                  <AvatarImage src='https://avatars.githubusercontent.com/u/62931549?v=4' />
                  <AvatarFallback>ishiko</AvatarFallback>
                </Avatar>
              </Link>
              <div className='space-y-1'>
                <h4 className='text-sm font-semibold underline underline-offset-1'>
                  <Link href='https://github.com/ishiko732' target='_blank'>
                    @ishiko732
                  </Link>
                </h4>
                <p className='text-sm'>
                  I'm ishiko, a Node.js Engineer from ShenZheng.
                </p>
                <br />
                <p className='text-sm'>
                  The current ts-fsrs-demo is using
                  <Badge variant='outline' className='cursor-pointer'>
                    <Link
                      href={'https://github.com/open-spaced-repetition/ts-fsrs'}
                      target='_blank'
                    >
                      ts-fsrs
                    </Link>
                  </Badge>{' '}
                  version :{' '}
                  <span className='underline underline-offset-1'>
                    <Link
                      href={`https://www.npmjs.com/package/ts-fsrs/v/${FSRSVersion}`}
                      target='_blank'
                    >
                      {FSRSVersion}
                    </Link>
                  </span>
                  , and the build environment :{' '}
                  <span className='font-bold'> {env}</span>
                </p>
                <div className='flex items-center py-4'>
                  <Building2 className='mr-2 h-4 w-4 opacity-70' />{' '}
                  <Link
                    href='https://github.com/open-spaced-repetition'
                    target={'_blank'}
                  >
                    <span className='text-xs text-muted-foreground underline underline-offset-1'>
                      open-spaced-repetition
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

export default Logo;
