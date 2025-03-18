// import { zValidator } from '@hono/zod-validator'
import { zValidator } from '@hono/zod-validator'
import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import cardService from '@server/services/decks/cards'
import { Hono } from 'hono'

import { PageSchema } from './cards.schema'

const CardApp = new Hono<Env>()
  .use(RequireAuth())

  .get('/', zValidator('query', PageSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const pagination = c.req.valid('query')

    const data = await cardService.getAllCardIds(userId, pagination)
    return c.json(data)
  })
export default CardApp
export type CardAppType = typeof CardApp
