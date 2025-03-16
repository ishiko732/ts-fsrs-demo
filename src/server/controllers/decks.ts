import { zValidator } from '@hono/zod-validator'
import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import deckService from '@server/services/decks'
import { Hono } from 'hono'

import { CreateDeckSchema, ModifyDeckSchema } from './decks.schema'

const DeckApp = new Hono<Env>()
  .use(RequireAuth())
  .get('/default', async (c) => {
    const userId = Number(c.get('authUserId'))

    const deckId = await deckService.getDefaultDeck(userId)
    return c.json({ deckId: deckId })
  })
  .get('/:did', async (c) => {
    const userId = Number(c.get('authUserId'))
    const did = Number(c.req.param('did') ?? 0)

    const deck = await deckService.getDeck(userId, did)
    return c.json(deck)
  })
  .post('/', zValidator('json', CreateDeckSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const create_data = c.req.valid('json')
    const deck = await deckService.addDeck(userId, {
      ...create_data,
      fsrs: JSON.stringify(create_data.fsrs),
      card_limit: JSON.stringify(create_data.card_limit),
    })
    return c.json(deck)
  })
  .put('/:did', zValidator('json', ModifyDeckSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const did = Number(c.req.param('did') ?? 0)
    const modify_data = c.req.valid('json')

    const deck = await deckService.modifyDeck(
      userId,
      {
        ...modify_data,
        fsrs: modify_data.fsrs ? JSON.stringify(modify_data.fsrs) : undefined,
        card_limit: modify_data.card_limit ? JSON.stringify(modify_data.card_limit) : undefined,
      },
      did,
    )
    return c.json(deck)
  })

export default DeckApp
export type DeckAppType = typeof DeckApp
