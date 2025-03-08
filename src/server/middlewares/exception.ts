import * as Sentry from '@sentry/nextjs'
import type { Context } from 'hono'
import type { HTTPResponseError } from 'hono/types'

export function SystemException() {
  return (err: Error | HTTPResponseError, c: Context) => {
    Sentry.captureException(err)
    console.error(err)
    return c.json({ message: 'Internal Server Error', ok: false })
  }
}
