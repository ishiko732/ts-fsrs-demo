import type { Database } from '@models/index'
import envSchema from '@server/env'
import { Kysely, PostgresDialect } from 'kysely'
import pg, { type Pool, type PoolConfig } from 'pg'

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    host: envSchema.DB_HOST,
    port: envSchema.DB_PORT,
    database: envSchema.DB_DATABASE,
    user: envSchema.DB_USER,
    password: envSchema.DB_PASSWORD,
    max: envSchema.NODE_ENV === 'development' ? 1 : undefined,
    options: `-c search_path=${envSchema.DB_SCHEMA}`,
  } satisfies PoolConfig) as Pool,
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
  log: ['query'],
})

export type DBType = typeof db
