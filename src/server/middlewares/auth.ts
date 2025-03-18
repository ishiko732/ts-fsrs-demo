import { AuthHandler } from '@services/auth'
import { createMiddleware } from 'hono/factory'

export function AuthSession() {
  return createMiddleware(async (c, next) => {
    const auth = await AuthHandler()
    const [role, id] = (auth?.user.userKey ?? '').split(' ')
    c.set('authSession', auth)
    c.set('authUser', auth?.user)
    c.set('authUserId', id)
    c.set('authUserRole', role)
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
