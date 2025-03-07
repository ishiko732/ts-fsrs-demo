import { Hono } from 'hono'
const UserApp = new Hono().get('/session', async (c) => {
  const auth = c.get('authUser')
  return c.json(auth)
})

export default UserApp
export type UserAppType = typeof UserApp
