import { z } from 'zod'

export const NoteListSchema = z.object({
  did: z.number().optional(),
  keyword: z.string().optional(),
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

export const NoteSwitchDeleteSchema = z.object({
  deleted: z
    .string()
    .or(z.array(z.string()))
    .transform((v) => (Array.isArray(v) ? v[0] === '1' : v === '1')),
})

export const NoteGetSchema = z.object({
  did: z
    .string()
    .optional()
    .transform((v) => Number(v ?? 0)),
  question: z.string().optional(),
  answer: z.string().optional(),
  source: z.string().optional(),
  sourceId: z.string().optional(),
})

export const NoteAddSchema = z.object({
  did: z.number(),
  question: z.string(),
  answer: z.string(),
  source: z.string(),
  sourceId: z.string().optional(),
  extend: z.record(z.unknown()).optional(),
})

export const NoteModifySchema = NoteAddSchema.extend({
  updated: z.number().optional(),
})
