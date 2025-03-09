import type { Database } from '@models/index'
import envSchema from '@server/env'
import { Kysely, type KyselyConfig, PostgresDialect } from 'kysely'
import pg, { type Pool, type PoolConfig, types } from 'pg'

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: envSchema.DATABASE_URL,
    max: envSchema.NODE_ENV === 'development' ? 1 : undefined,
  } satisfies PoolConfig) as Pool,
})

types.setTypeParser(types.builtins.TIMESTAMP, (timeStr) => +timeStr)
types.setTypeParser(types.builtins.DATE, (timeStr) => +timeStr)

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.

const logs = new Set('error')
if (envSchema.NODE_ENV === 'development') {
  logs.add('query')
}
export const db = new Kysely<Database>({
  dialect,
  log: Array.from(logs) as KyselyConfig['log'],
})

export type DBType = typeof db
