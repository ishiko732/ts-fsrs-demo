import { zValidator } from '@hono/zod-validator'
import type { Env } from '@server/bindings'
import { RequireAuth } from '@server/middlewares/auth'
import reviewService from '@server/services/scheduler/review'
import { Hono } from 'hono'

import { ForgetSchema, NextReviewSchema, SuspendSchema, UndoReviewSchema } from './reviews.schema'

const ReviewApp = new Hono<Env>()
  .use(RequireAuth())
  .post('/suspend', zValidator('json', SuspendSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const { cid, suspended } = c.req.valid('json')

    const data = await reviewService.switch_suspend(userId, cid, Date.now(), suspended)
    return c.json(data)
  })
  .post('/forget', zValidator('json', ForgetSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const { cid, offset, reset_count } = c.req.valid('json')

    const data = await reviewService.forget(userId, cid, Date.now(), offset, reset_count)
    return c.json(data)
  })
  .post('/review', zValidator('json', NextReviewSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const { cid, rating, timestamp, offset, duration } = c.req.valid('json')

    const data = await reviewService.next(userId, cid, timestamp, rating, offset, duration)
    return c.json(data)
  })
  .delete('/review', zValidator('json', UndoReviewSchema), async (c) => {
    const userId = Number(c.get('authUserId'))
    const { cid, lid } = c.req.valid('json')

    const data = await reviewService.undo(userId, cid, lid)
    return c.json(data)
  })
  .get('/review/:cid', async (c) => {
    const userId = Number(c.get('authUserId'))
    const cid = Number(c.req.param('cid') ?? 0)

    const data = await reviewService.getReviewCardDetail(userId, cid)
    return c.json(data)
  })

export default ReviewApp
export type ReviewAppType = typeof ReviewApp
