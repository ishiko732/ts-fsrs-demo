'use server'

import { Card, Note, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import { fixState, State } from 'ts-fsrs'

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session'
import { deleteNoteByNid, getNoteByNid, getNoteCount, getNotes, restoreNoteByNid } from '@/lib/note'

export async function getNoteTotalCount({ query }: { query?: Prisma.NoteWhereInput }) {
  const uid = await getSessionUserId()
  if (!uid) {
    throw new Error('user not found.')
  }
  return getNoteCount({ uid, query })
}

export type NoteList = NoteSimpleInfo[]

export type NoteSimpleInfo = {
  nid: number
  cid: number
  question: string
  answer: string
  source: string
  sourceId: string
  D: number
  S: number
  due: number
  last_review?: number
  state: State
  reps: number
  deleted: boolean
}

export async function getNotesBySessionUserId({
  take,
  query,
  order,
  skip,
}: {
  take?: number
  skip?: number
  query?: Prisma.NoteWhereInput
  order?: Prisma.NoteOrderByWithRelationInput | Prisma.NoteOrderByWithRelationInput[]
}): Promise<NoteList> {
  const uid = await getSessionUserId()
  if (!uid) {
    throw new Error('user not found.')
  }

  const notes = await getNotes({
    uid: uid,
    take,
    query,
    order,
    skip,
  })

  return notes.map((note) => {
    return {
      nid: note.nid,
      cid: note.card.cid,
      question: note.question,
      answer: note.answer,
      source: note.source,
      sourceId: note?.sourceId ?? '',
      D: note.card.difficulty,
      S: note.card.stability,
      due: note.card.due.getTime(),
      last_review: note.card.last_review?.getTime() ?? 0,
      state: fixState(note.card.state),
      reps: note.card.reps,
      deleted: note.deleted,
    }
  })
}

export async function toggleHiddenNote(nid: number, hidden: boolean) {
  const res = hidden ? await deleteNoteByNid(nid) : await restoreNoteByNid(nid)
  revalidatePath(`/note/${nid}`)
  return res
}

export async function getUserNote(nid: number, deleted: boolean) {
  const uid = await getSessionUserId()
  if (!uid) {
    throw new Error('user not found.')
  }
  const note = await getNoteByNid(Number(nid), deleted)
  if (!note) {
    notFound()
  }
  if (note?.uid !== uid) {
    redirect('/denied')
  }
  return note as Note & { card: Card }
}
