'use client'
import { createAuthClient } from 'better-auth/react'

// Browser-side Better Auth client. The same baseURL Better Auth uses on the
// server is automatically picked up from `window.location.origin` when one is
// not provided.
export const authClient = createAuthClient()

export const { signIn, signOut, signUp, useSession } = authClient
