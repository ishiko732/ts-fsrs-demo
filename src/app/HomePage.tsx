import Link from 'next/link'
import React from 'react'

import packageInfo from '@/../package.json' with { type: 'json' }
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-static'

async function HomePage() {
  const { dependencies } = packageInfo
  const coreDeps = ['next', 'ts-fsrs', 'hono', 'kysely'] as const
  return (
    <>
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] ">
        <div>
          <p className="leading-7 [&:not(:first-child)]:mt-6">ts-fsrs-demo core dependencies:</p>
          <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
            {coreDeps.map((deps) => {
              return (
                <li key={deps}>
                  {deps} :{' '}
                  <Link href={`https://www.npmjs.com/package/${deps}/v/${String(dependencies[deps]).replace('^', '')}`} target="_blank">
                    <span className="underline underline-offset-2 hover:text-indigo-500">
                      {String(dependencies[deps]).replace('^', '')}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="items-center flex-1 ">
          <Link href={'/note'} legacyBehavior>
            <Button className="m-2 w-full sm:w-auto min-w-6">Go to Notes</Button>
          </Link>
          <Link href={'/review'} legacyBehavior>
            <Button className="m-2 w-full sm:w-auto min-w-6">Go to Review</Button>
          </Link>
          <Link href={'https://optimizer.parallelveil.com/'} target="_blank" rel="noopener noreferrer">
            <Button className="m-2 w-full sm:w-auto min-w-6">
              Go to Train <Badge className="badge badge-ghost">beta</Badge>
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default HomePage
