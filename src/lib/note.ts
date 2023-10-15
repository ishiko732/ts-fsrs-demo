import prisma from "./prisma";
import { NodeData } from "@/types";
import { createEmptyCardByPrisma } from "@/vendor/fsrsToPrisma";

export async function addNote(data: NodeData) {
  const question = data["英単語"];
  const answer = data["意味"];
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
        },
        include: { card: true },
      });
}

export async function addNotes(dates: NodeData[]) {
  const all = dates.map((note) => addNote(note));
  return Promise.all(all);
}

export async function getNotes(take?:number) {
  const notes = await prisma.note.findMany({ take: take });
  return notes;
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
