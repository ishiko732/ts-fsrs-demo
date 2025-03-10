import type { DefaultSession } from 'next-auth'
export type Bindings = object

export type Variables = {
  authSession?: UserSession
}

export interface UserSession {
  user: {
    id: string
    role: string
  } & DefaultSession
}

export interface Env {
  Bindings: Bindings
  Variables: Variables
}
