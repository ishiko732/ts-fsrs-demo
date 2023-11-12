import { CardPrisma, Grade, RecordLog, RevlogPrisma, fsrs} from "ts-fsrs";
import { getNoteByNid } from "./note";
import prisma from "./prisma";
import { stateFSRSRatingToPrisma, stateFSRSStateToPrisma } from "@/vendor/fsrsToPrisma";
import { findLastLogByCid } from "./log";


export async function schedulerCard(nid:number,now:Date){
    const note=await getNoteByNid(nid)
    if(!note){  
        throw new Error("note not found")
    }
    const f = fsrs()
    const cardByPrisma=note.card  as unknown as CardPrisma
    const card={
        ...cardByPrisma,
        // state:statePrismaToFSRSState(cardByPrisma.state),
        // due:fixDate(cardByPrisma.due),
        last_review:cardByPrisma.last_review?cardByPrisma.last_review:undefined
    }
    return f.repeat(card,now)
}


export async function updateCard(nid:number,now:Date,grade:Grade){
    const note=await getNoteByNid(nid)
    if(!note || !note.card){  
        throw new Error("note not found")
    }
    const data:RecordLog = await schedulerCard(Number(nid),now);
    const recordItem = data[Number(grade) as Grade]
    await prisma.card.update({
        where:{cid:note.card.cid},
        data:{
            due:recordItem.card.due,
            stability:recordItem.card.stability,
            difficulty:recordItem.card.difficulty,
            elapsed_days:recordItem.card.elapsed_days,
            scheduled_days:recordItem.card.scheduled_days,
            reps:recordItem.card.reps,
            lapses:recordItem.card.lapses,
            state:stateFSRSStateToPrisma(recordItem.card.state),
            last_review:recordItem.card.last_review|| null,
            logs:{
                create:{
                    grade:stateFSRSRatingToPrisma(recordItem.log.rating),
                    state:stateFSRSStateToPrisma(recordItem.log.state),
                    due:recordItem.log.due,
                    stability:recordItem.log.stability,
                    difficulty:recordItem.log.difficulty,
                    elapsed_days:recordItem.log.elapsed_days,
                    last_elapsed_days:recordItem.log.last_elapsed_days,
                    scheduled_days:recordItem.log.scheduled_days,
                    review:recordItem.log.review,
                },
            }
        },
        include:{
            logs:true
        }
    })
    // await prisma.$transaction([op1, op2]);
    return recordItem.card.state;
}


export async function rollbackCard(nid:number){
    const note=await getNoteByNid(nid)
    if(!note || !note.card){  
        throw new Error("note not found")
    }
    const log = await findLastLogByCid(note.card.cid)
    if(!log ){  
        throw new Error("log not found")
    }
    const cardByPrisma = note.card  as unknown as CardPrisma
    const logByPrisma = {
        ...log,
        rating:log.grade
    } as unknown as RevlogPrisma
    const f = fsrs()
    const backCard = f.rollback(cardByPrisma,logByPrisma) as CardPrisma

    const res = await prisma.card.update({
        where:{cid:note.card.cid},
        data:{
            due:backCard.due,
            stability:backCard.stability,
            difficulty:backCard.difficulty,
            elapsed_days:backCard.elapsed_days,
            scheduled_days:backCard.scheduled_days,
            reps:backCard.reps,
            lapses:backCard.lapses,
            state:stateFSRSStateToPrisma(backCard.state),
            last_review:backCard.last_review|| null,
            logs:{
                delete:{
                    lid:logByPrisma.lid
                }
            }
        },
        include:{
            logs:true
        }
    })
    return res.state;
}


export async function forgetCard(nid:number,now:Date,reset_count:boolean=false){
    const note=await getNoteByNid(nid)
    if(!note || !note.card){  
        throw new Error("note not found")
    }
    const cardByPrisma = note.card as unknown as CardPrisma

    const f = fsrs()
    const recordItem = f.forget(cardByPrisma, now, reset_count)
    await prisma.card.update({
        where:{cid:note.card.cid},
        data:{
            due:recordItem.card.due,
            stability:recordItem.card.stability,
            difficulty:recordItem.card.difficulty,
            elapsed_days:recordItem.card.elapsed_days,
            scheduled_days:recordItem.card.scheduled_days,
            reps:recordItem.card.reps,
            lapses:recordItem.card.lapses,
            state:stateFSRSStateToPrisma(recordItem.card.state),
            last_review:recordItem.card.last_review|| null,
            logs:{
                create:{
                    grade:stateFSRSRatingToPrisma(recordItem.log.rating),
                    state:stateFSRSStateToPrisma(recordItem.log.state),
                    due:recordItem.log.due,
                    stability:recordItem.log.stability,
                    difficulty:recordItem.log.difficulty,
                    elapsed_days:recordItem.log.elapsed_days,
                    last_elapsed_days:recordItem.log.last_elapsed_days,
                    scheduled_days:recordItem.log.scheduled_days,
                    review:recordItem.log.review,
                },
            }
        },
        include:{
            logs:true
        }
    })
    return recordItem.card.state;

}