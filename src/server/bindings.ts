import type { Env as HonoEnv } from 'hono'
export type Bindings = object

export type Variables = object

export type Env = HonoEnv & {
  bindings: Bindings
  variables: Variables
}
