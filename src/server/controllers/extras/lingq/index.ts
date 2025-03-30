import { zValidator } from '@hono/zod-validator'
import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import lingqService from '@server/services/extras/lingq'
import { Hono } from 'hono'

import { SingleSyncLingqSchema } from './index.schema'

const LingqApp = new Hono<Env>()
  .use(RequireAuth())

  .post('/sync', zValidator('json', SingleSyncLingqSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const { did, page, page_size } = c.req.valid('json')
    const params = await lingqService.getLingqInfoByDeckId(userId, did)
    if (!params.token || !params.lang) {
      return c.json({ error: 'No lingq token' }, 400)
    }

    const result = await lingqService.syncLingqs(
      userId,
      did,
      {
        token: params.token,
        lang: params.lang,
      },
      { page, page_size, loop: false },
    )
    if (!result) {
      return c.json({ error: 'Sync failed' }, 500)
    }
    return c.json({ message: 'Sync success', ...result }, 200)
  })

export default LingqApp
export type LingqAppType = typeof LingqApp
