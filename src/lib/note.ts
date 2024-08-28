import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import prisma from './prisma';
import { ProgeigoNodeData } from '@/types';
import { Card, Note, Prisma, PrismaPromise } from '@prisma/client';
import { JsonObject } from '@prisma/client/runtime/library';

export async function initProgeigoNotes(
  uid: number,
  deckId: number,
  dates: ProgeigoNodeData[]
) {
  const datum = dates.map((node) => {
    return {
      uid,
      did: deckId,
      question: node.英単語,
      answer: node.意味,
      source: 'ProgeigoNote',
      sourceId: `${node.$rowIndex}`,
      extend: node as unknown as JsonObject,
    } satisfies Omit<Note, 'nid' | 'deleted'>;
  });
  return prisma.note.createMany({ data: datum });
}

export async function getNotes({
  uid,
  take,
  query,
  order,
  skip,
}: {
  uid: number;
  take?: number;
  skip?: number;
  query?: Prisma.NoteWhereInput;
  order?:
    | Prisma.NoteOrderByWithRelationInput
    | Prisma.NoteOrderByWithRelationInput[];
}) {
  const where = {
    uid,
    deleted: false,
  };
  Object.assign(where, query);
  const notes = await prisma.note.findMany({
    take: take,
    where: where,
    orderBy: order,
    skip,
    include: { cards: true },
  });
  return notes as Array<Note & { cards: Card[] }>;
}

export async function getNoteCount({
  uid,
  query,
}: {
  uid: number;
  query?: Prisma.NoteWhereInput;
}) {
  const count = await prisma.note.count({
    where: {
      uid,
      deleted: false,
      ...query,
    },
  });
  return count;
}
export async function getNoteByNid(nid: number, deleted: boolean = false) {
  const note = await prisma.note.findFirst({
    where: {
      nid,
      deleted: deleted,
    },
    include: {
      cards: true,
    },
  });
  return note;
}

export async function getNoteByCid(cid: number, deleted: boolean = false) {
  const note = await prisma.note.findFirst({
    where: {
      cards: {
        some: {
          cid,
        },
      },
      deleted: deleted,
    },
    include: {
      cards: true,
    },
  });
  return note;
}
export async function getNoteByQuestion(
  question: string,
  deleted: boolean = false
) {
  const note = await prisma.note.findFirst({
    where: {
      question,
      deleted: deleted,
    },
    include: {
      cards: true,
    },
  });
  return note;
}

export async function delNoteByQuestion(
  question: string,
  deleted: boolean = false
) {
  const note = await getNoteByQuestion(question);
  if (!note) {
    return false;
  }
  return prisma.note.delete({
    where: {
      deleted: deleted,
      nid: note.nid,
    },
  });
}

export async function deleteNoteByNid(nid: number) {
  const [note, uid] = await Promise.all([
    getNoteByNid(nid),
    getSessionUserId(),
  ]);
  if (!uid || !note?.uid) {
    throw new Error('user not found.');
  }
  if (note.uid !== uid) {
    throw new Error('user not match.');
  }
  prisma.$transaction([
    prisma.card.update({
      select: {
        cid: true,
        deleted: true,
      },
      where: {
        cid: note?.cards?.[0].cid ?? -1,
      },
      data: {
        deleted: true,
      },
    }),
    prisma.revlog.updateMany({
      where: {
        cid: note?.cards?.[0].cid ?? -1,
      },
      data: {
        deleted: true,
      },
    }),
    prisma.note.update({
      select: {
        nid: true,
        deleted: true,
      },
      where: {
        nid: nid,
      },
      data: {
        deleted: true,
      },
    }),
  ]);
  return { cid: note?.cards?.[0].cid, nid: note?.nid! } as {
    cid?: number;
    nid: number;
  };
}

export async function restoreNoteByNid(nid: number, cid?: number) {
  const restore: PrismaPromise<
    | { nid: number; deleted: boolean }
    | { cid: number; deleted: boolean }
    | Prisma.BatchPayload
  >[] = [];
  if (cid) {
    restore.push(
      prisma.card.update({
        select: {
          cid: true,
          deleted: true,
        },
        where: {
          cid: cid,
        },
        data: {
          deleted: false,
        },
      })
    );
    restore.push(
      prisma.revlog.updateMany({
        where: {
          cid: cid,
        },
        data: {
          deleted: false,
        },
      })
    );
  }
  restore.push(
    prisma.note.update({
      select: {
        nid: true,
        deleted: true,
      },
      where: {
        nid: nid,
      },
      data: {
        deleted: false,
      },
    })
  );
  return prisma.$transaction(restore);
}
