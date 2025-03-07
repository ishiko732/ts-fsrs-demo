import { Env } from '@server/bindings'
import UserApp from '@server/controllers/users'
import { InitGlobalMiddlewares } from '@server/middlewares/global'
import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { handle } from 'hono/vercel'

export const runtime = 'nodejs'

const app = InitGlobalMiddlewares(new Hono<Env>().basePath('/api'))

const routes = app
  .notFound(async (c) => {
    return c.json({ error: 'Not found' }, 404)
  })
  .route('/users', UserApp)

const handler = handle(app)

if (process.env.NODE_ENV === 'development') {
  showRoutes(app)
}
export { handler as DELETE, handler as GET, handler as POST, handler as PUT }
export type AppType = typeof routes
