import type { Context } from 'hono'
import type { HTTPResponseError } from 'hono/types'

export function SystemException() {
  return (err: Error | HTTPResponseError, c: Context) => {
    console.error(err)
    return c.json({ message: 'Internal Server Error', error: err }, 500)
  }
}
