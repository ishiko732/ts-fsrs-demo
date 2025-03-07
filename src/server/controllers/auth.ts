import { Hono } from 'hono'

const AuthApp = new Hono().get('protected', async (c) => {
  const auth = c.get('authUser')
  return c.json(auth)
})

export default AuthApp
export type AppType = typeof AuthApp
