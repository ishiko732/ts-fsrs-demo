import type { Database } from '@server/models'
import type { CardTable } from '@server/models/cards'
import deckModel, { type DeckTable } from '@server/models/decks'
import { type NoteTable } from '@server/models/notes'
import type { Insertable, Transaction } from 'kysely'
import { type Card, createEmptyCard, generatorParameters } from 'ts-fsrs'

import progeigo from '@/../public/プログラミング必須英単語600+.json' assert { type: 'json' }

export function initData(uid: number) {
  return deckModel.db.transaction().execute(async (trx) => {
    const now = new Date()
    const deck = await trx.insertInto('decks').values(initDeck(uid, now)).returning(['id']).executeTakeFirst()
    if (!deck) {
      throw new Error('Failed to create deck')
    }
    await initProgeigoDates(trx, uid, deck.id, now)
  })
}

// init progeigo dates
export async function initProgeigoDates(trx: Transaction<Database>, uid: number, did: number, now: Date) {
  const dates: ProgeigoNodeData[] = progeigo.data.英単語.map((node) => node.data) as ProgeigoNodeData[]
  const datum = dates
    .slice(0, 60)
    .map((data) => initProgeigoNote(uid, did, data, now))
    .filter(Boolean) as Insertable<NoteTable>[]

  const notes = await trx.insertInto('notes').values(datum).returning(['uid', 'did', 'id', 'created']).execute()
  const card_for_fsrs = createEmptyCard(now)

  const cards = notes.map((note) => initCard(note.uid, note.did, note.id, card_for_fsrs))
  await trx.insertInto('cards').values(cards).execute()
}

function initProgeigoNote(uid: number, did: number, data: ProgeigoNodeData, now: Date): Insertable<NoteTable> | null {
  const question = data.英単語
  const answer = data.意味
  if (!question || !answer) {
    return null
  }

  return {
    uid,
    did,
    question,
    answer,
    extend: JSON.stringify(data),
    created: +now,
    updated: +now,
  }
}

function initDeck(uid: number, now: Date): Insertable<DeckTable> {
  return {
    uid,
    name: 'プログラミング必須英単語600+',
    description: 'プログラミング必須英単語600+',
    fsrs: JSON.stringify(generatorParameters()),
    card_limit: JSON.stringify({
      new: 50,
      review: -1,
      learning: -1,
      suspended: 8,
    }),
    created: +now,
    updated: +now,
  }
}

function initCard(uid: number, did: number, nid: number, card: Card): Insertable<CardTable> {
  return Object.assign(card, { uid, did, nid, due: +card.due })
  // {
  //   uid,
  //   did,
  //   nid,
  //   ...card,
  //   // due: card.due,
  //   // stability: card.stability,
  //   // difficulty: card.difficulty,
  //   // elapsed_days: card.elapsed_days,
  //   // scheduled_days: card.scheduled_days,
  //   // reps: card.reps,
  //   // state: card.state,
  // }
}
