import 'server-only'
import envSchema from '@server/env'
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import pg from 'pg'

// Production builds use GitHub OAuth as the only sign-in method, while
// non-production environments (vercel preview / local dev) additionally
// expose Better Auth's email/password provider with auto-signup so that
// previewers can log in with the default dev user (see app/signin).
const isProduction =
  (process.env.NEXT_PUBLIC_VERCEL_ENV ?? envSchema.NODE_ENV) === 'production'

const pool = new pg.Pool({
  connectionString: envSchema.DATABASE_URL,
  max: envSchema.NODE_ENV === 'development' ? 1 : undefined,
})

export const DEFAULT_DEV_USER = {
  email: 'dev@example.com',
  password: 'devpassword',
  name: 'DevUser',
} as const

export const auth = betterAuth({
  appName: 'ts-fsrs-demo',
  baseURL: envSchema.BETTER_AUTH_URL || undefined,
  secret: envSchema.BETTER_AUTH_SECRET || undefined,
  trustedOrigins: envSchema.BETTER_AUTH_URL
    ? [envSchema.BETTER_AUTH_URL]
    : undefined,
  database: pool,
  user: {
    additionalFields: {
      // Numeric id of the matching row in the legacy `users` table. Filled in
      // lazily by the session enrichment helper after the first login.
      appUserId: {
        type: 'number',
        required: false,
        defaultValue: null,
        input: false,
      },
      // 'admin' | 'user' — derived from GitHub admin id (or always 'admin'
      // for the dev user). Mirrored to additional fields so it travels in the
      // session payload without an extra join.
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  socialProviders: envSchema.GITHUB_ID
    ? {
        github: {
          clientId: envSchema.GITHUB_ID,
          clientSecret: envSchema.GITHUB_SECRET,
        },
      }
    : undefined,
  emailAndPassword: !isProduction
    ? {
        enabled: true,
        autoSignIn: true,
        minPasswordLength: 1,
      }
    : undefined,
  plugins: [nextCookies()],
})

export type Auth = typeof auth
