import { getAuthSession } from '@/app/(auth)/api/auth/[...nextauth]/session';
import Link from 'next/link';
import React from 'react';
import { dependencies } from '@/../package.json' assert { type: 'json' };
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

async function HomePage() {
  const session = await getAuthSession();

  const coreDeps = [
    '@prisma/client',
    'next',
    'ts-fsrs',
    'fsrs-browser',
  ] as const;
  console.log(dependencies['ts-fsrs']);
  return (
    <>
      <div className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] '>
        <div>
          <p className='leading-7 [&:not(:first-child)]:mt-6'>
            ts-fsrs-demo core dependencies:
          </p>
          <ul className='my-6 ml-6 list-disc [&>li]:mt-2'>
            {coreDeps.map((deps) => {
              return (
                <li key={deps}>
                  {deps} :{' '}
                  <Link
                    href={`https://www.npmjs.com/package/${deps}/v/${String(
                      dependencies[deps]
                    ).replace('^', '')}`}
                    target='_blank'
                  >
                    <span className='underline underline-offset-2 hover:text-indigo-500'>
                      {String(dependencies[deps]).replace('^', '')}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className='items-center'>
          <Link href={session?.user ? '/note' : '/api/auth/signin'}>
            <Button className='btn btn-outline m-2 w-full sm:w-auto'>
              Go to Notes
            </Button>
          </Link>
          <Link href={session?.user ? '/card' : '/api/auth/signin'}>
            <Button className='btn btn-outline m-2 py-4 w-full sm:w-auto'>
              Go to Review
            </Button>
          </Link>
          <Link href={'/train'}>
            <Button
              className='btn btn-outline m-2 py-4 w-full sm:w-auto'
              title='Train(alpha)'
            >
              Go to Train
              <Badge className='badge badge-ghost'>alpha</Badge>
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default HomePage;
