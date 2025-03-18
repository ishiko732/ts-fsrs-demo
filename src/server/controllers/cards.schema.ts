import { z } from 'zod'

export const PageSchema = z.object({
  page: z.string().transform(Number),
  pageSize: z.string().transform(Number),
})
