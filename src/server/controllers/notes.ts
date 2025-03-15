import { zValidator } from '@hono/zod-validator'
import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import noteService from '@server/services/decks/notes'
import { Hono } from 'hono'
import { z } from 'zod'

const NoteListSchema = z.object({
  did: z.number().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
  deleted: z.boolean().optional(),
  page: z.object({
    page: z.number(),
    pageSize: z.number(),
  }),
  order: z
    .object({
      question: z.enum(['asc', 'desc']).optional(),
      answer: z.enum(['asc', 'desc']).optional(),
      source: z.enum(['asc', 'desc']).optional(),
      due: z.enum(['asc', 'desc']).optional(),
      state: z.enum(['asc', 'desc']).optional(),
      reps: z.enum(['asc', 'desc']).optional(),
      stability: z.enum(['asc', 'desc']).optional(),
      difficulty: z.enum(['asc', 'desc']).optional(),
      retrievability: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
})

const NoteSwitchDeleteSchema = z.object({
  deleted: z
    .string()
    .or(z.array(z.string()))
    .transform((v) => (Array.isArray(v) ? v[0] === '1' : v === '1')),
})

const NoteApp = new Hono<Env>()
  .use(RequireAuth())
  .post('/', zValidator('json', NoteListSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const query = c.req.valid('json')
    const data = await noteService.getList({ uid: userId, ...query })
    return c.json(data)
  })
  .delete('/:nid', zValidator('query', NoteSwitchDeleteSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const nid = Number(c.req.param('nid') ?? 0)
    const { deleted } = c.req.valid('query')
    await noteService.switch_delete(userId, [nid], deleted)
    return c.json({ success: true })
  })

export default NoteApp
export type NoteAppType = typeof NoteApp
