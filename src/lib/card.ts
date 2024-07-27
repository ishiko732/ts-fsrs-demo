import { Grade, fixState } from "ts-fsrs";
import { getNoteByCid, getNoteByNid } from "./note";
import prisma from "./prisma";
import { findLastLogByCid } from "./log";
import { getFSRSBySessionUser } from "./fsrs";
import { Card, Note } from "@prisma/client";
import { RecordLogPrisma, RepeatRecordLog, forgetAfterHandler, repeatAfterHandler, rollbackAfterHandler } from "@/vendor/fsrsToPrisma/handler";
import { CardUpdatePayload } from "@/types";

type Query={
    nid:number;
    cid:number;
}

// BUG not exist note
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


export function schedulerCard(query:Partial<Query>,now:Date): Promise<RecordLogPrisma>;
export function schedulerCard<T extends Grade>(query:Partial<Query>,now:Date,grade?:Grade): Promise<T extends Grade ? RepeatRecordLog : RecordLogPrisma>;

export async function schedulerCard<T extends Grade>(query:Partial<Query>,now:Date,grade?:Grade):Promise<T extends Grade ? RepeatRecordLog : RecordLogPrisma>{
    if(!query.nid && !query.cid){
        throw new Error("nid or cid not found")
    }
    const cardByPrisma = query.cid? await findCardByCid(query.cid): 
                                query.nid ? await findCardByNid(query.nid): null;
    if(!cardByPrisma){  
        throw new Error("card not found")
    }
    const { f, userParams } = await getFSRSBySessionUser(cardByPrisma.note.uid);
    const card={
        ...cardByPrisma,
        nid:cardByPrisma.note.nid,
        last_review:cardByPrisma.last_review?cardByPrisma.last_review:undefined
    }
    const repeatAfterHandlerExtendSuspended = repeatAfterHandler.bind(null,userParams.lapses)
    console.log(f.parameters)
    const repeat = f.repeat(card,now,repeatAfterHandlerExtendSuspended)
    console.log(repeat)
    if(grade){
        return repeat[grade] as T extends Grade ? RepeatRecordLog : RecordLogPrisma
    }else{
        return repeat as T extends Grade ? RepeatRecordLog : RecordLogPrisma
    }
}



function getUpdateCardPayloadByScheduler(recordItem:RepeatRecordLog,duration:number){
    const payload: CardUpdatePayload = {
        due:recordItem.card.due,
        stability:recordItem.card.stability,
        difficulty:recordItem.card.difficulty,
        elapsed_days:recordItem.card.elapsed_days,
        scheduled_days:recordItem.card.scheduled_days,
        reps:recordItem.card.reps,
        lapses:recordItem.card.lapses,
        state:recordItem.card.state,
        last_review:recordItem.card.last_review,
        suspended:recordItem.card.suspended,
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
    }
    return payload;
}

export async function updateCard(cid:number,now:Date,grade:Grade,duration:number){
    const recordItem = await schedulerCard(
      { cid },
      now,
      Number(grade) as Grade
    );
    const payload = getUpdateCardPayloadByScheduler(recordItem,duration)
    await prisma.card.update({
        where:{cid:cid},
        data:payload,
        include:{
            logs:true
        }
    })
    // await prisma.$transaction([op1, op2]);
    return {
        nextState:fixState(recordItem.card.state),
        nextDue:recordItem.card.due,
        suspended:recordItem.card.suspended,
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
    const [log,{f}] =await Promise.all([findLastLogByCid(cardByPrisma.cid), getFSRSBySessionUser(cardByPrisma.note.uid)])
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

