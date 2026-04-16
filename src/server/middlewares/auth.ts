import { getAuthSessionFromHeaders } from '@services/auth'
import { createMiddleware } from 'hono/factory'

export function AuthSession() {
  return createMiddleware(async (c, next) => {
    // Use the request's raw headers (rather than next/headers()) so this
    // middleware also works when Hono is mounted outside the Next.js
    // request scope.
    const session = await getAuthSessionFromHeaders(c.req.raw.headers)
    c.set('authSession', session ?? undefined)
    c.set('authUser', session?.user)
    c.set(
      'authUserId',
      session?.user?.appUserId != null
        ? String(session.user.appUserId)
        : undefined
    )
    c.set('authUserRole', session?.user?.role)
    await next()
  })
}

export interface IAuthRequireOptions {
  unauthorizedJson?: Record<string, unknown>
}

export function RequireAuth(options?: IAuthRequireOptions) {
  return createMiddleware(async (c, next) => {
    if (c.get('authUserId')) {
      await next()
      return
    }
    const json = options?.unauthorizedJson || { message: 'Unauthorized' }
    return c.json(json, { status: 403 })
  })
}
