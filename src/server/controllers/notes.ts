import { zValidator } from '@hono/zod-validator'
import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import noteService from '@server/services/decks/notes'
import { Hono } from 'hono'

import { NoteAddSchema, NoteGetSchema, NoteListSchema, NoteModifySchema, NoteSwitchDeleteSchema } from './notes.schema'

const NoteApp = new Hono<Env>()
  .use(RequireAuth())
  .post('/list', zValidator('json', NoteListSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const query = c.req.valid('json')
    const data = await noteService.getList({ uid: userId, ...query })
    return c.json(data)
  })
  .post('/', zValidator('json', NoteAddSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const json = c.req.valid('json')
    const addData = { ...json, extend: JSON.stringify(json.extend ?? {}) }

    const data = await noteService.addNote(userId, addData.did, addData)
    return c.json({ nid: data, success: true })
  })
  .get('/:nid', zValidator('query', NoteGetSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const nid = Number(c.req.param('nid') ?? 0)
    const query = c.req.valid('query')

    const data = await noteService.getNote(userId, { ...query, nid })
    if (data) {
      return c.json(data)
    } else {
      return c.notFound()
    }
  })
  .put('/:nid', zValidator('json', NoteModifySchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const nid = Number(c.req.param('nid') ?? 0)
    const json = c.req.valid('json')
    const modifyData = { ...json, extend: json.extend ? JSON.stringify(json.extend) : undefined }

    const data = await noteService.modifyNote(userId, nid, modifyData)
    return c.json({ success: data })
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
