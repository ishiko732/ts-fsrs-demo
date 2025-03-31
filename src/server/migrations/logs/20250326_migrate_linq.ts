/* eslint-disable @typescript-eslint/no-explicit-any */
import envSchema from '@server/env'
import { type Kysely,sql } from 'kysely'
import { generatorParameters } from 'ts-fsrs'

function hex2buf(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
}

async function decryptLingqKey(lingqKey: string, encodeKey: string, counter: string) {
  const decodeToken = hex2buf(encodeKey)
  const importLingqKey = await crypto.subtle.importKey('raw', hex2buf(lingqKey), { name: 'AES-CTR', length: 32 }, true, [
    'encrypt',
    'decrypt',
  ])
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-CTR',
      counter: hex2buf(counter),
      length: 64,
    },
    importLingqKey,
    decodeToken,
  )
  return new TextDecoder().decode(decrypted).toString()
}

const lingq_deck = (uid: number, now: number) => {
  return {
    uid,
    name: 'Lingq Deck',
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
  const tableExists = await db.executeQuery<{ exists: number }>(sql`SELECT to_regclass('"Parameters"') as exists`.compile(db))
  if (!tableExists || tableExists.rows.length === 0 || !tableExists.rows[0]?.exists) {
    console.log('Parameters table does not exist, skipping migration.')
    return
  }

  // migrate Parameters -> extras

  const now = Date.now()
  const params = await db
    .selectFrom('Parameters')
    .select(['uid', 'lingq_token', 'lingq_counter'])
    .where('lingq_token', 'is not', null)
    .execute()

  if (params.length === 0) {
    return
  }
  const deck_info = await db
    .insertInto('decks')
    .values(params.map((it) => lingq_deck(it.uid, now)))
    .returning(['id as did', 'uid'])
    .execute()

  const uid_deckId_map = new Map<number, number>()
  for (const deck of deck_info) {
    if (!uid_deckId_map.has(deck.uid)) {
      uid_deckId_map.set(deck.uid, deck.did)
    }
  }

  const extra_info = []
  for (const param of params) {
    const key = await decryptLingqKey(envSchema.LINGQ_KEY, param.lingq_counter, param.lingq_token)
    const uid = param.uid
    const did = uid_deckId_map.get(uid)
    if (!did) {
      throw new Error(`deck not found for uid: ${uid}`)
    }
    extra_info.push({
      uid,
      did,
      name: 'lingq',
      description: 'Lingq Service',
      extra: { token: key, lang: 'en' },
      deleted: false,
      created: +now,
      updated: +now,
    })
  }

  if (extra_info.length === 0) {
    return
  }
  await db.insertInto('extras').values(extra_info).execute()
  /**
   * Revlogs
   * don't need to migrate
   */
  /**
    uid,max
    ??,2024-10-19 05:09:55.337000
    ??,2024-12-23 17:02:13.232000
    ??,2025-03-05 13:37:01.724000
   */
}

export async function down(db: Kysely<any>): Promise<void> {}
