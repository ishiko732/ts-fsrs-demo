/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely'
import { generatorParameters } from 'ts-fsrs'

const default_deck = (uid: number, now: number) => {
  return {
    uid,
    name: 'Default Deck',
    description: '',
    fsrs: JSON.stringify(generatorParameters()),
    card_limit: JSON.stringify({
      new: 50,
      review: Number.MAX_SAFE_INTEGER,
      learning: Number.MAX_SAFE_INTEGER,
      suspended: 8,
    }),
    created: +now,
    updated: +now,
  }
}

export async function up(db: Kysely<any>): Promise<void> {
  const tableExists = await db.executeQuery<{ exists: number }>(sql`SELECT to_regclass('"Users"') as exists`.compile(db))
  if (!tableExists || tableExists.rows.length === 0 || !tableExists.rows[0]?.exists) {
    console.log('User table does not exist, skipping migration.')
    return
  }
  // migrate User -> users
  // add default deck
  const now = Date.now()

  const user_info = await db
    .insertInto('users')
    .columns(['id', 'name', 'email', 'password', 'oauthId', 'oauthType'])
    .expression(db.selectFrom('User').select(['uid as id', 'name', 'email', 'password', 'oauthId', 'oauthType']))
    .returning('id')
    .execute()
  if (user_info.length === 0) {
    return
  }

  const decks_info = await db
    .insertInto('decks')
    .values(user_info.map((it) => default_deck(it.id, now)))
    .returning(['id as did', 'uid'])
    .execute()

  // migrate Note -> notes
  /**
   * select *
   * from Note
   * left join decks on Note.uid = decks.uid
   *
   * =>
   * insert into notes(id,uid,did,question,answer,source,sourceId,extend,deleted)
   * select nid as id,deck.uid as uid,deck.did as did,note...
   * from Note
   * left join decks on Note.uid = decks.uid
   */
  const migrate_note = db
    .insertInto('notes')
    .columns(['id', 'uid', 'did', 'question', 'answer', 'source', 'sourceId', 'extend', 'deleted'])
    .expression(
      db
        .selectFrom('Note')
        .select([
          'nid as id',
          'decks.uid as uid',
          'decks.id as did',
          'question',
          'answer',
          'source',
          'sourceId',
          /** https://stackoverflow.com/questions/60824247/convert-json-string-to-jsonb */
          sql<object>`(extend #>> '{}')::jsonb`.as('extend'),
          'Note.deleted as deleted',
        ])
        .leftJoin('decks', 'decks.uid', 'Note.uid'),
    )

  await migrate_note.execute()

  // Card -> cards
  const migrate_card = db
    .insertInto('cards')
    .columns([
      'id',
      'uid',
      'did',
      'nid',
      'due',
      'stability',
      'difficulty',
      'elapsed_days',
      'scheduled_days',
      'reps',
      'lapses',
      'state',
      'last_review',
      'suspended',
      'deleted',
    ])
    .expression(
      db
        .selectFrom('Card')
        .select([
          'Card.cid as id',
          'notes.uid as uid',
          'notes.did as did',
          'notes.id as nid',
          sql`(extract(epoch FROM due)::bigint * 1000)::bigint`.as('due'),
          'stability',
          'difficulty',
          'elapsed_days',
          'scheduled_days',
          'reps',
          'lapses',
          sql`CASE "Card".state
          WHEN '0'::"State" THEN 0
          WHEN '1'::"State" THEN 1 
          WHEN '2'::"State" THEN 2
          WHEN '3'::"State" THEN 3
        END`.as('state'),
          sql`(extract(epoch FROM last_review)::bigint * 1000)::bigint`.as('last_review'),
          'suspended',
          'Card.deleted as deleted',
        ])
        .leftJoin('notes', 'notes.id', 'Card.nid'),
    )
  await migrate_card.execute()

  // Revlog -> revlog
  await db
    .insertInto('revlog')
    .columns([
      'uid',
      'did',
      'nid',
      'cid',
      'grade',
      'state',
      'due',
      'stability',
      'difficulty',
      'elapsed_days',
      'last_elapsed_days',
      'scheduled_days',
      'review',
      'duration',
      'deleted',
      'offset',
    ])
    .expression(
      db
        .selectFrom('Revlog')
        .select([
          'cards.uid as uid',
          'cards.did as did',
          'cards.nid as nid',
          'cards.id as cid',
          sql`CASE grade
          WHEN '0'::"Rating" THEN 0
          WHEN '1'::"Rating" THEN 1
          WHEN '2'::"Rating" THEN 2
          WHEN  '3'::"Rating" THEN 3
          WHEN  '4'::"Rating"   THEN 4
        END`.as('grade'),
          sql`CASE "Revlog".state
          WHEN '0'::"State" THEN 0
          WHEN '1'::"State" THEN 1 
          WHEN '2'::"State" THEN 2
          WHEN '3'::"State" THEN 3
        END`.as('state'),
          sql`(extract(epoch FROM "Revlog".due)::bigint * 1000)::bigint`.as('due'),
          'Revlog.stability as stability',
          'Revlog.difficulty as difficulty',
          'Revlog.elapsed_days as elapsed_days',
          'Revlog.last_elapsed_days as last_elapsed_days',
          'Revlog.scheduled_days as scheduled_days',
          sql`(extract(epoch FROM "Revlog".review)::bigint * 1000)::bigint`.as('review'),
          'duration',
          'Revlog.deleted as deleted',
          sql`0`.as('offset'),
        ])
        .leftJoin('cards', 'cards.id', 'Revlog.cid'),
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {}
