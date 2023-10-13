import { createEmptyCardByPrisma } from "ts-fsrs";
import prisma from "./prisma";

type Data={
    [key:string]:any
}


export async function addNote(data:Data,questionField:string,answerField:string){

    const question=data[questionField]
    const answer = data[answerField]
    if(!question||!answer){
        return false;
    }

    const fc = createEmptyCardByPrisma();
    prisma.card.create({
        data: {
            ...fc,
            note: {
                create: {
                    question,
                    answer,
                    extend: data,
                },
            }
        },
    });
}

export async function getNotes(){
    const notes = await prisma.note.findMany({
        include: {
            card: true,
        },
    });
    return notes;
}

export async function getNoteByQuestion(question:string){
    const note = await prisma.note.findFirst({
        where:{
            question,
        },
        include:{
            card:true,
        },
    });
    return note;
}

export async function delNoteByQuestion(question:string){
    const note= await getNoteByQuestion(question);
    if(!note){
        return false;
    }
    await prisma.note.delete({
        where:{
            nid:note.nid,
        },
    });
    return true;
}