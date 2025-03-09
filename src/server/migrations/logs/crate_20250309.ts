/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // create UserTable
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull())
    .addColumn('password', 'varchar(255)', (col) => col.defaultTo(''))
    .addColumn('oauthId', 'varchar(255)', (col) => col.notNull())
    .addColumn('oauthType', 'varchar(255)', (col) => col.notNull())
    .addColumn('created', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema.createIndex('users_email_index').on('users').columns(['email']).unique().execute()
  await db.schema.createIndex('users_oauth_index').on('users').columns(['oauthId', 'oauthType']).unique().execute()
  await db.schema.createIndex('users_created_index').on('users').columns(['created']).execute()

  // create DeckTable
  await db.schema
    .createTable('decks')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('uid', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('fsrs', 'jsonb', (col) => col.notNull())
    .addColumn('card_limit', 'jsonb', (col) => col.notNull())
    .addColumn('deleted', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('created', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema.createIndex('decks_uid_index').on('decks').columns(['uid']).execute()
  await db.schema.createIndex('decks_created_index').on('decks').columns(['created']).execute()

  // create NoteTable
  await db.schema
    .createTable('notes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('uid', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('did', 'integer', (col) => col.references('decks.id').onDelete('cascade').notNull())
    .addColumn('question', 'text', (col) => col.notNull())
    .addColumn('answer', 'text', (col) => col.notNull())
    .addColumn('sourceId', 'varchar(255)')
    .addColumn('extend', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('deleted', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('created', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema.createIndex('notes_uid_index').on('notes').columns(['uid']).execute()
  await db.schema.createIndex('notes_did_index').on('notes').columns(['did']).execute()

  // create CardTable
  await db.schema
    .createTable('cards')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('uid', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('did', 'integer', (col) => col.references('decks.id').onDelete('cascade').notNull())
    .addColumn('nid', 'integer', (col) => col.references('notes.id').onDelete('cascade').notNull())
    .addColumn('due', 'integer', (col) => col.notNull())
    .addColumn('stability', 'float8', (col) => col.notNull())
    .addColumn('difficulty', 'float8', (col) => col.notNull())
    .addColumn('elapsed_days', 'integer', (col) => col.notNull())
    .addColumn('last_elapsed_days', 'integer', (col) => col.notNull())
    .addColumn('scheduled_days', 'integer', (col) => col.notNull())
    .addColumn('reps', 'integer', (col) => col.notNull())
    .addColumn('state', 'varchar(50)', (col) => col.notNull())
    .addColumn('last_review', 'timestamptz')
    .addColumn('suspended', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('deleted', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('created', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema.createIndex('cards_uid_did_index').on('cards').columns(['uid', 'did']).execute()

  // create RevlogTable
  await db.schema
    .createTable('revlog')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('uid', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('did', 'integer', (col) => col.references('decks.id').onDelete('cascade').notNull())
    .addColumn('cid', 'integer', (col) => col.references('cards.id').onDelete('cascade').notNull())
    .addColumn('grade', 'varchar(50)', (col) => col.notNull())
    .addColumn('state', 'varchar(50)', (col) => col.notNull())
    .addColumn('due', 'timestamptz', (col) => col.notNull())
    .addColumn('stability', 'float8', (col) => col.notNull())
    .addColumn('difficulty', 'float8', (col) => col.notNull())
    .addColumn('elapsed_days', 'integer', (col) => col.notNull())
    .addColumn('last_elapsed_days', 'integer', (col) => col.notNull())
    .addColumn('scheduled_days', 'integer', (col) => col.notNull())
    .addColumn('review', 'timestamptz', (col) => col.notNull())
    .addColumn('duration', 'integer', (col) => col.notNull())
    .addColumn('deleted', 'boolean', (col) => col.defaultTo(false).notNull())
    .execute()

  await db.schema.createIndex('revlog_uid_index').on('revlog').columns(['uid']).execute()
  await db.schema.createIndex('revlog_did_index').on('revlog').columns(['uid', 'did']).execute()
  await db.schema.createIndex('revlog_cid_index').on('revlog').columns(['uid', 'cid']).execute()

  // create ExtraTable
  await db.schema
    .createTable('extras')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('uid', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('did', 'integer', (col) => col.references('decks.id').onDelete('cascade').notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('extra', 'jsonb', (col) => col.notNull())
    .addColumn('deleted', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('created', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  await db.schema.createIndex('extra_uid_index').on('extras').columns(['uid']).execute()
  await db.schema.createIndex('extra_did_index').on('extras').columns(['uid', 'did']).execute()
}
