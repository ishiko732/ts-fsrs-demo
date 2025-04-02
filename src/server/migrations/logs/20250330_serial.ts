/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  db.executeQuery(sql`select setval('"users_id_seq"', (SELECT MAX(id) FROM "users") + 1);`.compile(db))
  db.executeQuery(sql`select setval('"extras_id_seq"', (SELECT MAX(id) FROM "extras") + 1);`.compile(db))
  db.executeQuery(sql`select setval('"decks_id_seq"', (SELECT MAX(id) FROM "decks") + 1);`.compile(db))
  db.executeQuery(sql`select setval('"notes_id_seq"', (SELECT MAX(id) FROM "notes") + 1);`.compile(db))
  db.executeQuery(sql`select setval('"cards_id_seq"', (SELECT MAX(id) FROM "cards") + 1);`.compile(db))
  db.executeQuery(sql`select setval('"revlog_id_seq"', (SELECT MAX(id) FROM "revlog") + 1);`.compile(db))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function down(db: Kysely<any>): Promise<void> {}
