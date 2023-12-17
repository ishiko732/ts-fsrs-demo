import prisma from "./prisma";
import { ProgeigoNodeData, NodeData } from "@/types";
import { createEmptyCardByPrisma } from "@/vendor/fsrsToPrisma";
import { Card, Note, Prisma } from "@prisma/client";


export async function addNote(data: Partial<NodeData>) {
  const question = data.question;
  const answer = data.answer;
  if (!question || !answer) {
    return false;
  }

  const fc = createEmptyCardByPrisma();
  const _note = await prisma.note.findFirst({
    where: { question },
    select: { nid: true },
  });
  return _note
    ? prisma.note.update({
        where: {
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

export async function addProgeigoNote(data: ProgeigoNodeData) {
  const question = data.英単語;
  const answer = data.意味;
  if (!question || !answer) {
    return false;
  }

  const fc = createEmptyCardByPrisma();
  const _note = await prisma.note.findFirst({
    where: { question },
    select: { nid: true },
  });
  return _note
    ? prisma.note.update({
        where: {
          nid: _note ? _note.nid : undefined,
        },
        data: {
          question,
          answer,
          extend: JSON.stringify(data),
        },
      })
    : prisma.note.create({
        data: {
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

export async function addProgeigoNotes(dates: ProgeigoNodeData[]) {
  const all = dates.map((note) => addProgeigoNote(note));
  return Promise.all(all);
}

export async function getNotes({take,query,order}:{take?: number, query?: Prisma.NoteWhereInput,order?:Prisma.NoteOrderByWithRelationInput | Prisma.NoteOrderByWithRelationInput[]}) {
    const notes = await prisma.note.findMany({ take: take, where: query,orderBy:order,include: { card: true }});
    return notes as Array<Note & { card: Card}>;
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
