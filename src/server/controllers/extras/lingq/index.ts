import { zValidator } from '@hono/zod-validator'
import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import deckService from '@server/services/decks'
import lingqService from '@server/services/extras/lingq'
import { Hono } from 'hono'
import { proxy } from 'hono/proxy'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { SessionSchema, SingleSyncLingqSchema } from './index.schema'

const LingqApp = new Hono<Env>()
  .use(RequireAuth())
  .get('/session', zValidator('query', SessionSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const { did } = c.req.valid('query')
    let deckId = 0
    if (did) {
      deckId = Number(did)
    } else {
      deckId = await deckService.getDefaultDeck(userId)
    }
    const params = await lingqService.getLingqInfoByDeckId(userId, deckId)

    return c.json({
      lingqKey: params?.token ?? '',
      lang: params?.lang ?? '',
      deckId,
      userId,
    })
  })

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
  .all('/proxy/*', async (c) => {
    let path = c.req.path.replace('/api/extras/lingq/proxy/', '')
    const searchParams = new URL(c.req.url).searchParams
    if (searchParams.size > 0) {
      path += '?' + searchParams.toString()
    }
    const proxy_path = `https://www.lingq.com/api/${path}`
    console.log('proxy', proxy_path)
    if (c.req.method === 'PATCH') {
      const result = await fetch(proxy_path, {
        ...c.req,
        method: 'PATCH',
        headers: {
          ...c.req.header(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      const headers = result.headers as unknown as Record<string, string | string[]>
      return c.text(await result.text(), result.status as ContentfulStatusCode, headers)
    }
    const result = proxy(proxy_path, {
      ...c.req,
      headers: {
        ...c.req.header(),
      },
    })
    return result
  })

export default LingqApp
export type LingqAppType = typeof LingqApp
