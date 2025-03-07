import GitHub from '@auth/core/providers/github'
import { initAuthConfig } from '@hono/auth-js'
export const InitAuth = initAuthConfig((c) => {
  return {
    secret: c.env?.AUTH_SECRET || process.env.AUTH_SECRET,
    providers: [
      GitHub({
        clientId: c.env?.GITHUB_ID || process.env.GITHUB_ID,
        clientSecret: c.env?.GITHUB_SECRET || process.env.GITHUB_SECRET,
      }),
    ],
  }
})
