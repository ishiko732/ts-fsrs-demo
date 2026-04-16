import Link from 'next/link'

import packageInfo from '@/../package.json' with { type: 'json' }
import { Button } from '@/components/ui/button'

export const dynamic = 'force-static'

async function HomePage() {
  const { dependencies } = packageInfo
  const coreDeps = ['next', 'ts-fsrs', 'hono', 'kysely'] as const
  return (
    <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] ">
      <div>
        <p className="leading-7 not-first:mt-6">
          ts-fsrs-demo core dependencies:
        </p>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          {coreDeps.map((deps) => {
            return (
              <li key={deps}>
                {deps} :{' '}
                <Link
                  href={`https://www.npmjs.com/package/${deps}/v/${String(dependencies[deps]).replace('^', '')}`}
                  target="_blank"
                >
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
        <Button asChild className="m-2 w-full sm:w-auto min-w-6">
          <Link href={'/note'}>Manage Notes</Link>
        </Button>
        <Button asChild className="m-2 w-full sm:w-auto min-w-6">
          <Link href={'/review'}>Start Review</Link>
        </Button>
        <Button asChild className="m-2 w-full sm:w-auto min-w-6">
          <Link
            href={'https://optimizer.parallelveil.com/'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Optimize Parameters
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default HomePage
