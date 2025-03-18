import { createMiddleware } from 'hono/factory'

export function ResponseTime() {
  return createMiddleware(async (c, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    c.res.headers.set('X-Response-Time', `${ms}ms`)
  })
}
