import { z } from 'zod'

export const SingleSyncLingqSchema = z.object({
  did: z.number(),
  page: z.number().optional().default(1),
  page_size: z.number().min(1).optional().default(50),
})

export const SessionSchema = z.object({
  did: z.string().optional(),
})
