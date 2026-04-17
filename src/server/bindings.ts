import type { AppSession, AppSessionUser } from '@services/auth/session'

export type Bindings = object

export type Variables = {
  authSession?: AppSession
  authUser?: AppSessionUser
  authUserId?: string
  authUserRole?: string
}

export type UserSession = AppSession

export interface Env {
  Bindings: Bindings
  Variables: Variables
}
