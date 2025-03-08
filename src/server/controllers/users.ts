import { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import { Hono } from 'hono'
const UserApp = new Hono<Env>().use(RequireAuth()).get('/session', async (c) => {
  const auth = c.get('authSession')
  return c.json(auth)
})

export default UserApp
export type UserAppType = typeof UserApp
