import { CardPrisma, Grade, RecordLog, RecordLogItem, createEmptyCard, fsrs} from "ts-fsrs";
import { getNoteByNid } from "./note";
import { fixDate } from "ts-fsrs/dist/help";
import prisma from "./prisma";
import { State } from "@prisma/client";
import { stateFSRSRatingToPrisma, stateFSRSStateToPrisma } from "@/vendor/fsrsToPrisma";


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
    // const op1= prisma.control.update({
    //     where:{id:1},
    //     data:{
    //         today_new:{
    //             increment:1
    //         }
    //     }
    // })
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
            last_review:recordItem.card.last_review!!,
            logs:{
                create:{
                    grade:stateFSRSRatingToPrisma(recordItem.log.rating),
                    state:stateFSRSStateToPrisma(recordItem.log.state),
                    due:recordItem.log.due,
                    stability:recordItem.log.stability,
                    difficulty:recordItem.log.difficulty,
                    elapsed_days:recordItem.log.elapsed_days,
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

