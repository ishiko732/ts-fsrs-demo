import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import { Hono } from 'hono'

import LingqApp from './lingq'

const ExtraApp = new Hono<Env>().use(RequireAuth()).route('/lingq', LingqApp)

export default ExtraApp
export type ExtraAppType = typeof ExtraApp
