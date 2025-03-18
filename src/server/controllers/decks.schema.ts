import { generatorParameters } from 'ts-fsrs'
import { z } from 'zod'

import { FSRSParameterSchema } from './reviews.schema'

export const CardLimitSchema = z.object({
  new: z.number().min(0).optional().default(50),
  review: z.number().min(0).optional().default(Number.MAX_SAFE_INTEGER),
  learning: z.number().min(0).optional().default(Number.MAX_SAFE_INTEGER),
  suspended: z.number().min(1).optional().default(8),
})

export const CreateDeckSchema = z.object({
  name: z.string(),
  description: z.string(),
  fsrs: FSRSParameterSchema.optional().default(generatorParameters()),
  card_limit: CardLimitSchema,
})

export const ModifyDeckSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  fsrs: FSRSParameterSchema.optional(),
  card_limit: z
    .object({
      new: z.number().min(0),
      review: z.number().min(0),
      learning: z.number().min(0),
      suspended: z.number().min(1),
    })
    .optional(),
})
