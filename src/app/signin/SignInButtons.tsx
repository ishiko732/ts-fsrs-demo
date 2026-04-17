'use client'
import { authClient } from '@server/services/auth/client'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

// Default development user — must match DEFAULT_DEV_USER on the server
// (see src/server/services/auth/auth.ts). The dev sign-in button signs the
// user up on first use (autoSignIn is enabled), then signs in for subsequent
// previews.
const DEV_USER = {
  email: 'dev@example.com',
  password: 'devpassword',
  name: 'DevUser',
} as const

type Props = {
  callbackUrl: string
  allowDevSignIn: boolean
  githubEnabled: boolean
}

export default function SignInButtons({
  callbackUrl,
  allowDevSignIn,
  githubEnabled,
}: Props) {
  const [loading, setLoading] = useState<'github' | 'dev' | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Prevent open redirect: only allow relative paths (starting with '/')
  // and reject protocol-relative URLs ('//...').
  const safeCallbackUrl =
    callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/'

  const handleGitHub = async () => {
    setError(null)
    setLoading('github')
    const { error } = await authClient.signIn.social({
      provider: 'github',
      callbackURL: safeCallbackUrl,
    })
    if (error) {
      setError(error.message ?? 'GitHub sign-in failed')
      setLoading(null)
    }
  }

  const handleDev = async () => {
    setError(null)
    setLoading('dev')
    // Try the standard sign-in first; if the user does not exist yet, fall
    // back to sign-up (which auto-signs the user in via authClient).
    const signInResult = await authClient.signIn.email({
      email: DEV_USER.email,
      password: DEV_USER.password,
      callbackURL: safeCallbackUrl,
    })
    if (signInResult.error) {
      const signUpResult = await authClient.signUp.email({
        email: DEV_USER.email,
        password: DEV_USER.password,
        name: DEV_USER.name,
        callbackURL: safeCallbackUrl,
      })
      if (signUpResult.error) {
        setError(signUpResult.error.message ?? 'Dev sign-in failed')
        setLoading(null)
        return
      }
    }
    window.location.assign(safeCallbackUrl)
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-stretch gap-4 px-6 pt-24">
      <h1 className="text-center text-3xl font-semibold">Sign in</h1>
      {githubEnabled ? (
        <Button onClick={handleGitHub} disabled={loading !== null}>
          {loading === 'github' ? 'Redirecting…' : 'Sign in with GitHub'}
        </Button>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          GitHub OAuth is not configured. Set GITHUB_ID / GITHUB_SECRET to
          enable production sign-in.
        </p>
      )}
      {allowDevSignIn && (
        <Button
          variant="outline"
          onClick={handleDev}
          disabled={loading !== null}
        >
          {loading === 'dev' ? 'Signing in…' : 'Sign in as Dev (preview)'}
        </Button>
      )}
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  )
}
