import { Card, Note, Prisma, PrismaPromise } from "@prisma/client";
import { getSessionUserId } from '@server/services/auth/session'

import { NodeData,ProgeigoNodeData } from "@/types";
import { createEmptyCardByPrisma } from "@/vendor/fsrsToPrisma";

import prisma from "./prisma";


export async function addNote(data: Partial<NodeData> & { uid: number }) {
  const question = data.question;
  const answer = data.answer;
  if (!question || !answer) {
    return false;
  }
  const uid = data.uid
  const fc = createEmptyCardByPrisma();
  const _note = await prisma.note.findFirst({
    where: { question },
    select: { nid: true },
  });
  return _note
    ? prisma.note.update({
      where: {
        uid,
        nid: _note ? _note.nid : undefined,
      },
      data: {
        question,
        answer,
        extend: data.extend ? JSON.stringify(data.extend) : "",
      },
    })
    : prisma.note.create({
      data: {
        uid,
        question,
        answer,
        extend: data.extend ? JSON.stringify(data.extend) : "",
        card: {
          create: fc,
        },
        source: "manual",
      },
      include: { card: true },
    });
}

export async function initProgeigoNote(uid: number, data: ProgeigoNodeData) {
  const question = data.英単語;
  const answer = data.意味;
  if (!question || !answer) {
    return false;
  }

  const fc = createEmptyCardByPrisma();
  return prisma.note.create({
    data: {
      uid,
      question,
      answer,
      extend: JSON.stringify(data),
      card: {
        create: fc,
      },
      source: 'プログラミング必須英単語600+'
    },
    include: { card: true },
  });
}

export async function initProgeigoNotes(uid: number, dates: ProgeigoNodeData[]) {
  const all = dates.map((note) => initProgeigoNote(uid, note));
  return Promise.all(all);
}

export async function getNotes({ uid, take, query, order, skip }: { uid: number, take?: number, skip?: number, query?: Prisma.NoteWhereInput, order?: Prisma.NoteOrderByWithRelationInput | Prisma.NoteOrderByWithRelationInput[] }) {
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
    include: { card: true },
  });
  return notes as Array<Note & { card: Card }>;
}

export async function getNoteCount({ uid, query }: { uid: number, query?: Prisma.NoteWhereInput }) {
  const count = await prisma.note.count({
    where: {
      uid,
      deleted: false,
      ...query
    }
  });
  return count;
}
export async function getNoteByNid(nid: number, deleted: boolean = false) {
  const note = await prisma.note.findFirst({
    where: {
      nid,
      deleted: deleted
    },
    include: {
      card: true,
    },
  });
  return note;
}

export async function getNoteByCid(cid: number, deleted: boolean = false) {
  const note = await prisma.note.findFirst({
    where: {
      card: {
        cid
      },
      deleted: deleted,
    },
    include: {
      card: true,
    },
  });
  return note;
}
export async function getNoteByQuestion(question: string, deleted: boolean = false) {
  const note = await prisma.note.findFirst({
    where: {
      question,
      deleted: deleted,
    },
    include: {
      card: true,
    },
  });
  return note;
}

export async function delNoteByQuestion(question: string, deleted: boolean = false) {
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
        deleted: true
      },
      where: {
        cid: note?.card?.cid ?? -1
      },
      data: {
        deleted: true
      }
    }),
    prisma.revlog.updateMany({
      where: {
        cid: note?.card?.cid ?? -1
      },
      data: {
        deleted: true
      }
    }),
    prisma.note.update({
      select: {
        nid: true,
        deleted: true
      },
      where: {
        nid: nid
      },
      data: {
        deleted: true
      }
    })
  ]);
  return { cid: note?.card?.cid, nid: note?.nid } as { cid?: number, nid: number };
}


export async function restoreNoteByNid(nid: number, cid?: number) {
  const restore: PrismaPromise<{ nid: number, deleted: boolean } | { cid: number, deleted: boolean } | Prisma.BatchPayload>[] = []
  if (cid) {
    restore.push(prisma.card.update({
      select: {
        cid: true,
        deleted: true
      },
      where: {
        cid: cid
      },
      data: {
        deleted: false
      }
    }))
    restore.push(prisma.revlog.updateMany({
      where: {
        cid: cid
      },
      data: {
        deleted: false
      }
    }))
  }
  restore.push(prisma.note.update({
    select: {
      nid: true,
      deleted: true
    },
    where: {
      nid: nid
    },
    data: {
      deleted: false
    }
  }))
  return prisma.$transaction(restore);
}