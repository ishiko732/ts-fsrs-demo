// Ref: https://next-auth.js.org/getting-started/typescript#module-augmentation

import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      userKey: string
    } & DefaultSession
  }

  interface User extends DefaultUser {
    userKey: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userKey: string
  }
}
