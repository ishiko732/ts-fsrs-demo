import type { Env } from '@server/bindings'
import NoteApp from '@server/controllers/notes'
import UserApp from '@server/controllers/users'
import env from '@server/env'
import { InitGlobalMiddlewares } from '@server/middlewares/global'
import { Hono } from 'hono'
import { showRoutes } from 'hono/dev'
import { handle } from 'hono/vercel'

export const runtime = 'nodejs'

const app = InitGlobalMiddlewares(new Hono<Env>().basePath('/api'))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .notFound(async (c) => {
    return c.json({ error: 'Not found' }, 404)
  })
  .route('/users', UserApp)
  .route('/notes', NoteApp)

const handler = handle(app)

if (env.NODE_ENV === 'development') {
  showRoutes(app)
}
export { handler as DELETE, handler as GET, handler as POST, handler as PUT }
export type AppType = typeof routes
