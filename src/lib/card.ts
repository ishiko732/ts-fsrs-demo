import { Grade } from "ts-fsrs";
import { getNoteByCid, getNoteByNid } from "./note";
import prisma from "./prisma";
import { findLastLogByCid } from "./log";
import { getFSRS } from "./fsrs";
import { getDuration, setSchedulerTime } from "./duration";
import { Card, Note } from "@prisma/client";
import { forgetAfterHandler, repeatAfterHandler, rollbackAfterHandler } from "@/vendor/fsrsToPrisma/handler";

type Query={
    nid:number;
    cid:number;
}

export async function findCardByNid(nid:number){
    const note=await getNoteByNid(nid)
    if(!note || !note.card){  
        throw new Error("note not found")
    }

    return note.card as Card&{note:Note}
}

export async function findCardByCid(cid:number){
    const card = await prisma.card.findUnique({
        where:{
            cid
        },
        include:{
            note:true,
        }
    })
    if(!card){
        throw new Error("card not found")
    }
    return card as Card&{note:Note}
}


export async function schedulerCard(query:Partial<Query>,now:Date){
    if(!query.nid && !query.cid){
        throw new Error("nid or cid not found")
    }
    const cardByPrisma = query.cid? await findCardByCid(query.cid): 
                                query.nid ? await findCardByNid(query.nid): null;
    if(!cardByPrisma){  
        throw new Error("card not found")
    }
    const f = await getFSRS(cardByPrisma.cid)
    const card={
        ...cardByPrisma,
        nid:cardByPrisma.note.nid,
        last_review:cardByPrisma.last_review?cardByPrisma.last_review:undefined
    }
    await setSchedulerTime(cardByPrisma.cid, now)
    return f.repeat(card,now,repeatAfterHandler)
}


export async function updateCard(cid:number,now:Date,grade:Grade){
    const [_,duration,data]=await Promise.all([getFSRS(cid,true),getDuration(cid,now),schedulerCard({cid},now)])
    const recordItem = data[Number(grade) as Grade]
    await prisma.card.update({
        where:{cid:cid},
        data:{
            due:recordItem.card.due,
            stability:recordItem.card.stability,
            difficulty:recordItem.card.difficulty,
            elapsed_days:recordItem.card.elapsed_days,
            scheduled_days:recordItem.card.scheduled_days,
            reps:recordItem.card.reps,
            lapses:recordItem.card.lapses,
            state:recordItem.card.state,
            last_review:recordItem.card.last_review|| null,
            logs:{
                create:{
                    grade:recordItem.log.rating,
                    state:recordItem.log.state,
                    due:recordItem.log.due,
                    stability:recordItem.log.stability,
                    difficulty:recordItem.log.difficulty,
                    elapsed_days:recordItem.log.elapsed_days,
                    last_elapsed_days:recordItem.log.last_elapsed_days,
                    scheduled_days:recordItem.log.scheduled_days,
                    review:recordItem.log.review,
                    duration: duration
                },
            }
        },
        include:{
            logs:true
        }
    })
    // await prisma.$transaction([op1, op2]);
    return {
        nextState:recordItem.card.state,
        nextDue:recordItem.card.due,
        nid:(recordItem.card as Card&{nid:number}).nid
    };;
}



export async function rollbackCard(query:Partial<Query>){
    if(!query.nid && !query.cid){
        throw new Error("nid or cid not found")
    }
    const cardByPrisma =query.cid? await findCardByCid(query.cid): 
                                query.nid? await findCardByNid(query.nid): null;
    if(!cardByPrisma){  
        throw new Error("card not found")
    }
    const [log,f] =await Promise.all([findLastLogByCid(cardByPrisma.cid), getFSRS(cardByPrisma.cid)])
    if(!log){  
        throw new Error("log not found")
    }
    const backCard = f.rollback(cardByPrisma,log,rollbackAfterHandler)

    const res = await prisma.card.update({
        where:{cid:cardByPrisma.cid},
        data:{
            ...backCard,
            logs:{
                delete:{
                    lid:log.lid
                }
            }
        },
        include:{
            logs:true
        }
    })
    return await getNoteByCid(cardByPrisma.cid);
}


export async function forgetCard(cid:number,now:Date,reset_count:boolean=false){
    const cardByPrisma = await findCardByCid(cid);
    const f = await getFSRS(cardByPrisma.cid)
    const recordItem = f.forget(cardByPrisma, now, reset_count,forgetAfterHandler)
    await prisma.card.update({
        where:{cid},
        data:recordItem,
        include:{
            logs:true
        }
    })
    return {
        nextState:recordItem.state,
        nextDue:recordItem.due,
        nid:cardByPrisma.note.nid as number
    };
}