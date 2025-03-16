// import { zValidator } from '@hono/zod-validator'
import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import deckService from '@server/services/decks'
import { Hono } from 'hono'

const DeckApp = new Hono<Env>().use(RequireAuth()).get('/default', async (c) => {
  const userId = Number(c.get('authUserId'))

  const deckId = await deckService.getDefaultDeck(userId)
  return c.json({ deckId: deckId })
})
export default DeckApp
export type DeckAppType = typeof DeckApp
