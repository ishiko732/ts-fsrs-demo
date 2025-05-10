/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('cards')
    .addColumn('learning_steps', 'integer', (col) => col.notNull().defaultTo(0))
    .execute()

  await db.schema
    .alterTable('revlog')
    .addColumn('learning_steps', 'integer', (col) => col.notNull().defaultTo(0))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('cards').dropColumn('learning_steps').execute()

  await db.schema.alterTable('revlog').dropColumn('learning_steps').execute()
}
