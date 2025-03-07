import { authHandler, verifyAuth } from '@hono/auth-js'
import { Env } from '@server/bindings'
import type { Hono, Schema } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { trimTrailingSlash } from 'hono/trailing-slash'
import type { BlankSchema } from 'hono/types'

import { InitAuth } from './auth'
import { SystemException } from './exception'
import { ResponseTime } from './time'

export function InitGlobalMiddlewares<E extends Env, S extends Schema = BlankSchema, BasePath extends string = '/'>(
  app: Hono<E, S, BasePath>,
) {
  app.use(cors())
  app.use(logger())
  app.use(ResponseTime())
  app.use(prettyJSON())
  app.use(trimTrailingSlash()) // /about/me/ -> /about/me
  app.use(contextStorage())
  app.use('*', InitAuth)
  app.use('auth/*', authHandler())
  app.use('*', verifyAuth())

  app.onError(SystemException())
  return app
}
