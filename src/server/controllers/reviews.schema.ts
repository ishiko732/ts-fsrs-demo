import { type FSRSParameters, Rating } from 'ts-fsrs'
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

export const FSRSParameterSchema = z.object({
  request_retention: z
    .number()
    .min(0.7, { message: 'Value must be at least 0.7' })
    .max(0.99, { message: 'Value must be no more than 0.99' })
    .refine((val) => (val * 100) % 1 === 0, {
      message: 'Value must be a multiple of 0.01',
    })
    .refine(Number.isFinite, { message: 'Value must be a finite number' }),
  maximum_interval: z.number().min(7).max(36500),
  w: z
    .array(z.number())
    .length(21)
    .transform((v) =>
      typeof v === 'string'
        ? (v as string)
            .replace(/[\[\]]/g, '')
            .split(',')
            .map(Number)
        : v,
    ),
  enable_fuzz: z.boolean(),
  enable_short_term: z.boolean(),
  learning_steps: z
    .array(z.string().regex(/^\d+[mhd]$/))
    .transform((steps) => steps as FSRSParameters['learning_steps'])
    .default([]),
  relearning_steps: z
    .array(z.string().regex(/^\d+[mhd]$/))
    .transform((steps) => steps as FSRSParameters['relearning_steps'])
    .default([]),
})

export const RescheduleSchema = z.object({
  cids: z.array(z.number()),
  parameters: FSRSParameterSchema.optional(),
})
