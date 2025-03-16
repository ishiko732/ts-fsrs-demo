import { Rating } from 'ts-fsrs'
import { z } from 'zod'

export const SuspendSchema = z.object({
  cid: z.number(),
  suspended: z.boolean(),
})

export const ForgetSchema = z.object({
  cid: z.number(),
  forget: z.boolean(),
  offset: z.number(),
  reset_count: z.boolean().optional().default(false),
})

export const NextReviewSchema = z.object({
  cid: z.number(),
  rating: z.number().min(Rating.Again).max(Rating.Easy),
  timestamp: z.number(),
  offset: z.number(),
  duration: z.number().min(0).optional().default(0),
})

export const UndoReviewSchema = z.object({
  cid: z.number(),
  lid: z.number(),
})

export const RescheduleSchema = z.object({
  cids: z.array(z.number()),
  parameters: z
    .object({
      request_retention: z.number(),
      maximum_interval: z.number(),
      w: z.array(z.number()).length(19),
      enable_fuzz: z.boolean(),
      enable_short_term: z.boolean(),
    })
    .optional(),
})
