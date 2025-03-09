import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  /** NextAuth */
  NEXTAUTH_URL: z.string().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().default(''),

  /** GitHub */
  GITHUB_ID: z.string().default(''),
  /** openssl rand -base64 32 */
  GITHUB_SECRET: z.string().default(''),
  GITHUB_ADMIN_ID: z
    .string()
    .default('62931549')
    .transform((val) => Number(val)),
  /** Postgres */
  DATABASE_URL: z.string().default(''),

  /** Extra */
  LINGQ_KEY: z.string().default(''),
  CRON_SECRET: z.string().default(''),
})

export default envSchema.parse(process.env)
