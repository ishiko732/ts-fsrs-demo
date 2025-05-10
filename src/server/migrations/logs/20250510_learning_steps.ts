/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('cards')
    .addColumn('learningSteps', 'integer', (col) => col.notNull().defaultTo(0))
    .execute()

  await db.schema
    .alterTable('revlog')
    .addColumn('learningSteps', 'integer', (col) => col.notNull().defaultTo(0))
    .execute()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function down(db: Kysely<any>): Promise<void> {}
