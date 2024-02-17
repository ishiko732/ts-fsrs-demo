import prisma from "./prisma";
import { ProgeigoNodeData, NodeData } from "@/types";
import { createEmptyCardByPrisma } from "@/vendor/fsrsToPrisma";
import { Card, Note, Prisma, PrismaPromise, Revlog } from "@prisma/client";
import { findLogsByCid } from "./log";


export async function addNote(data: Partial<NodeData>&{uid:number}) {
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
          extend: data.extend?JSON.stringify(data.extend):"",
        },
      })
    : prisma.note.create({
        data: {
          uid,
          question,
          answer,
          extend: data.extend?JSON.stringify(data.extend):"",
          card: {
            create: fc,
          },
          source: "manual",
        },
        include: { card: true },
      });
}

export async function initProgeigoNote(uid:number,data: ProgeigoNodeData) {
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

export async function initProgeigoNotes(uid:number,dates: ProgeigoNodeData[]) {
  const all = dates.map((note) => initProgeigoNote(uid,note));
  return Promise.all(all);
}

export async function getNotes({uid,take,query,order,skip}:{uid: number, take?: number, skip?:number,query?: Prisma.NoteWhereInput,order?:Prisma.NoteOrderByWithRelationInput | Prisma.NoteOrderByWithRelationInput[]}) {
    const notes = await prisma.note.findMany({ take: take, where: {
      uid,
      ...query
    },orderBy:order,skip,include: { card: true }});
    return notes as Array<Note & { card: Card}>;
}

export async function getNoteCount({uid,query}:{uid: number, query?: Prisma.NoteWhereInput}) {
  const count = await prisma.note.count({where: {
    uid,
    ...query
  }});
  return count;
}
export async function getNoteByNid(nid: number) {
    const note = await prisma.note.findFirst({
        where: {
            nid,
        },
        include: {
        card: true,
        },
    });
    return note;
}

export async function getNoteByCid(cid: number) {
  const note = await prisma.note.findFirst({
      where: {
          card:{
            cid
          },
      },
      include: {
      card: true,
      },
  });
  return note;
}
export async function getNoteByQuestion(question: string) {
  const note = await prisma.note.findFirst({
    where: {
      question,
    },
    include: {
      card: true,
    },
  });
  return note;
}

export async function delNoteByQuestion(question: string) {
  const note = await getNoteByQuestion(question);
  if (!note) {
    return false;
  }
  return prisma.note.delete({
    where: {
      nid: note.nid,
    },
  });
}


export async function deleteNoteByNid(nid: number) {
  const note = await getNoteByNid(nid);
  const revlog = await findLogsByCid(note?.card?.cid??-1)
  prisma.$transaction([
    prisma.revlog.deleteMany({
      where: {
        cid: note?.card?.cid?? -1,
      },
    }),
    prisma.card.delete({
      where: {
        cid:note?.card?.cid ?? -1,
      },
    }),
    prisma.note.delete({
      where: {
        nid,
      }
    }),
  ]);
  return {revlog,card:note?.card,note:note!}  as {revlog:Revlog[],card:Card|undefined,note:Note};
}


export async function restoreNoteByNid(note:Note,revlog: Revlog[],card?:Card) {
  const restore:PrismaPromise<Note|Card|Prisma.BatchPayload>[]=[]
  if(card){
    restore.push(prisma.card.create({
      data: card,
    }))
    if(revlog.length>0){
      restore.push(prisma.revlog.createMany({
        data: revlog
      }))
    }
  }
  restore.push(prisma.note.create({
    data: {
      ...note,
      extend:note.extend as string,
    },
  }))
  return prisma.$transaction(restore);
}