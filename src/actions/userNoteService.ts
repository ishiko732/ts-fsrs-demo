'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import {
  deleteNoteByNid,
  getNoteByNid,
  getNoteCount,
  getNotes,
  restoreNoteByNid,
} from '@/lib/note';
import prisma from '@lib/prisma';
import {
  addNote,
  deleteNote,
  getNote_cache,
  getNotesByDeckId,
  getNotes as getNotesByNoteIds,
  updateNote,
} from '@lib/reviews/note/retriever';
import { Card, Note, Prisma } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { State, fixState } from 'ts-fsrs';

export async function getNoteTotalCount({
  query,
}: {
  query?: Prisma.NoteWhereInput;
}) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  return await getNoteCount({ uid, query });
}

export type NoteList = NoteSimpleInfo[];

export type NoteSimpleInfo = {
  did: number;
  nid: number;
  cid: number;
  question: string;
  answer: string;
  source: string;
  sourceId: string;
  D: number;
  S: number;
  due: number;
  last_review?: number;
  state: State;
  reps: number;
  deleted: boolean;
};

export async function getNotesBySessionUserId({
  take,
  query,
  order,
  skip,
}: {
  take?: number;
  skip?: number;
  query?: Prisma.NoteWhereInput;
  order?:
    | Prisma.NoteOrderByWithRelationInput
    | Prisma.NoteOrderByWithRelationInput[];
}): Promise<NoteList> {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }

  const notes = await getNotes({
    uid: uid,
    take,
    query,
    order,
    skip,
  });

  return notes.map((note) => {
    return {
      did: note.did,
      nid: note.nid,
      cid: note.cards[0].cid,
      question: note.question,
      answer: note.answer,
      source: note.source,
      sourceId: note?.sourceId ?? '',
      D: note.cards[0].difficulty,
      S: note.cards[0].stability,
      due: note.cards[0].due.getTime(),
      last_review: note.cards[0].last_review?.getTime() ?? 0,
      state: fixState(note.cards[0].state),
      reps: note.cards[0].reps,
      deleted: note.deleted,
    };
  });
}

export async function toggleHiddenNote(nid: number, hidden: boolean) {
  const res = hidden ? await deleteNoteByNid(nid) : await restoreNoteByNid(nid);
  revalidatePath(`/note/${nid}`);
  return res;
}

export async function getUserNote(nid: number, deleted: boolean) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const note = await getNoteByNid(Number(nid), deleted);
  if (!note) {
    notFound();
  }
  if (note?.uid !== uid) {
    redirect('/denied');
  }
  return note as Note & { cards: Card[] };
}

export async function getNoteAction(nid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const note = await getNote_cache(uid, nid)();
  return note;
}

export async function getNotesByDeckIdAction(
  deckId: number,
  page: number = 1,
  pageSize: number = 50
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const note = await getNotesByDeckId(uid, deckId, page, pageSize);
  return note;
}

export async function getNotesByNoteIdsAction(noteIds: number[]) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const note = await getNotesByNoteIds(uid, noteIds);
  return note;
}

export async function addNoteAction(
  did: number,
  note: Omit<Note, 'did' | 'uid' | 'deleted' | 'nid'>
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  return await addNote(uid, did, note);
}

export async function addNotesAction(
  did: number,
  notes: Omit<Note, 'did' | 'uid' | 'deleted' | 'nid'>[]
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const merge_data: (Omit<Note, 'nid' | 'extend'> & {
    extend: Prisma.InputJsonValue;
  })[] = notes.map((note) => {
    return {
      ...note,
      did,
      uid,
      deleted: false,
      extend: (note.extend ? note.extend : {}) as Prisma.InputJsonValue,
    };
  });
  const data =  await prisma.note.createMany({
    data: merge_data,
  });

  revalidateTag(`actions/decks/${uid}/deleted/1`);
  revalidateTag(`actions/decks/${uid}/deleted/0`);
  revalidatePath(`/deck`);
  return data
}

export async function updateNoteAction(
  did: number,
  nid: number,
  note: Partial<Omit<Note, 'did' | 'uid' | 'deleted'>>
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await updateNote(uid, did, nid, note);
  revalidateTag(`actions/note/${uid}/${nid}`);
  return res;
}

export async function deleteNoteAction(nid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await deleteNote(uid, nid, false);
  revalidateTag(`actions/note/${uid}/${nid}`);
  return res;
}

export async function restoreNoteAction(nid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await deleteNote(uid, nid, true);
  revalidateTag(`actions/note/${uid}/${nid}`);
  return res;
}
