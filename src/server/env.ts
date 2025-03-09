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
    .number()
    .default(62931549)
    .transform((val) => Number(val)),
  /** Postgres */
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((val) => parseInt(val, 10)),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_DATABASE: z.string().default('postgres'),
  DB_SCHEMA: z.string().default('public'),

  /** Extra */
  LINGQ_KEY: z.string().default(''),
  CRON_SECRET: z.string().default(''),
})

export default envSchema.parse(process.env)
