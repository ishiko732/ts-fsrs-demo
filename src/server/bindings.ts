import type { DefaultSession } from 'next-auth'
export type Bindings = object

export type Variables = {
  authSession?: UserSession
  authUser?: UserSession['user']
  authUserId?: string
  authUserRole?: string
}

export interface UserSession {
  user: {
    id: string
    role: string
    userKey: string
  } & DefaultSession
}

export interface Env {
  Bindings: Bindings
  Variables: Variables
}
