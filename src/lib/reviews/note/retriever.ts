import 'server-only';
import prisma from '@/lib/prisma';
import { unstable_cache as cache, revalidateTag } from 'next/cache';
import { Note } from '@prisma/client';
export const getNote_cache = (uid: number, nid: number) => {
  return cache(
    async () => {
      return await prisma.note.findFirst({
        where: {
          uid,
          nid,
        },
      });
    },
    [`actions/note/${uid}/${nid}`],
    {
      tags: [`actions/${uid}/${nid}`],
    }
  ) satisfies () => Promise<Note | null>;
};

// crud
export const getNotes = async (uid: number, noteIds: number[]) => {
  return prisma.note.findMany({
    where: {
      uid,
      nid: {
        in: noteIds,
      },
    },
  });
};

export const getNotesByDeckId = async (
  uid: number,
  did: number,
  page: number = 1,
  pageSize: number = 50
) => {
  return prisma.note.findMany({
    where: {
      uid,
      did: did,
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });
};

export const addNote = async (
  uid: number,
  did: number,
  note: Omit<Note, 'did' | 'uid' | 'deleted' | 'nid'>
) => {
  return prisma.note.create({
    data: {
      ...note,
      uid: uid,
      did: did,
      extend: note.extend ? note.extend : {},
    },
  });
};

export const updateNote = async (
  uid: number,
  did: number,
  nid: number,
  note: Partial<Omit<Note, 'did' | 'uid' | 'deleted' | 'nid'>>
) => {
  return prisma.note.update({
    where: { did: did, uid: uid, nid: nid },
    data: {
      ...note,
      did: did,
      nid: nid,
      uid: uid,
      extend: note.extend ? note.extend : {},
    },
  });
};

export const deleteNote = async (
  uid: number,
  nid: number,
  restore?: boolean
) => {
  const cardIds = await prisma.card.findMany({
    select: {
      cid: true,
    },
    where: {
      nid: nid,
    },
  });
  const res = await prisma.$transaction([
    prisma.note.update({
      where: { nid: nid, uid },
      data: { deleted: restore ? false : true },
    }),
    prisma.card.updateMany({
      where: { nid: { in: cardIds.map((card) => card.cid) } },
      data: { deleted: restore ? false : true },
    }),
  ]);
  return res.length > 0;
};
