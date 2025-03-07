import { Env } from '@server/bindings'
import AuthApp from '@server/controllers/auth'
import { InitGlobalMiddlewares } from '@server/middlewares/global'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'nodejs'

const app = InitGlobalMiddlewares(new Hono<Env>().basePath('/api'))

const routes = app
  .notFound(async (c) => {
    return c.json({ error: 'Not found' }, 404)
  })
  .route('/auth', AuthApp)

const handler = handle(app)
export { handler as DELETE, handler as GET, handler as POST, handler as PUT }
export type AppType = typeof routes
