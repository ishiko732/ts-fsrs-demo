import type { Hono, Schema } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { trimTrailingSlash } from 'hono/trailing-slash'
import type { BlankEnv, BlankSchema } from 'hono/types'

import { AuthSession } from './auth'
import { SystemException } from './exception'
import { ResponseTime } from './time'

export function InitGlobalMiddlewares<E extends BlankEnv, S extends Schema = BlankSchema, BasePath extends string = '/'>(
  app: Hono<E, S, BasePath>,
) {
  app.use(cors())
  app.use(logger())
  app.use(ResponseTime())
  app.use(prettyJSON())
  app.use(trimTrailingSlash()) // /about/me/ -> /about/me
  app.use(contextStorage())
  app.use(AuthSession())

  app.onError(SystemException())
  return app
}
