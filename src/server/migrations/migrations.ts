import { promises as fs } from 'node:fs'
import path from 'node:path'

import { db } from '@server/libs/db'
import { FileMigrationProvider, Migrator } from 'kysely'

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, 'logs'),
  }),
  allowUnorderedMigrations: true,
})

// tsx --env-file=.env src/server/migrations/migrations.ts
const type = process.argv[2] as ('up' | 'down') | undefined

async function migrate() {
  const start = Date.now()
  const { error, results } =
    type === 'up' ? await migrator.migrateUp() : type === 'down' ? await migrator.migrateDown() : await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })
  const end = Date.now()
  console.log(`migrated in ${((end - start) / 1000).toFixed(2)}s`)
  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrate()
