import envSchema from '@server/env'
import { getAuthSession } from '@services/auth'
import { redirect } from 'next/navigation'

import SignInButtons from './SignInButtons'

type Params = {
  callbackUrl?: string
}

export const dynamic = 'force-dynamic'

export default async function SignInPage(props: {
  searchParams: Promise<Params>
}) {
  const { callbackUrl = '/' } = await props.searchParams
  const session = await getAuthSession()
  if (session?.user) {
    redirect(callbackUrl)
  }

  // Dev sign-in is gated by the Better Auth config (emailAndPassword is only
  // enabled in non-production), but we also hide the button in production
  // to keep the UI clean.
  const isProduction =
    (process.env.NEXT_PUBLIC_VERCEL_ENV ?? envSchema.NODE_ENV) === 'production'

  return (
    <SignInButtons
      callbackUrl={callbackUrl}
      allowDevSignIn={!isProduction}
      githubEnabled={Boolean(envSchema.GITHUB_ID)}
    />
  )
}
