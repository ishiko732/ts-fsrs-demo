import * as Sentry from '@sentry/nextjs'
import type { Context } from 'hono'
import type { HTTPResponseError } from 'hono/types'

import type { Env } from '../bindings.js'

export function SystemException<E extends Env = Env>() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
  return (err: Error | HTTPResponseError, c: Context<E, any, {}>) => {
    Sentry.captureException(err)
    return c.json({ message: 'Internal Server Error', ok: false })
  }
}
