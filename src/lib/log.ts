import { Revlog } from "@prisma/client";
import prisma from "./prisma";
import { Rating, State, date_scheduler } from "ts-fsrs";
import { RevlogPrismaUnChecked } from "@/vendor/fsrsToPrisma/handler";

export async function findLogsByCid(cid: number) {
    const logs = await prisma.revlog.findMany({
        where: {
            cid,
        },
        orderBy:{
            review:'desc'
        }
    })
    return logs
}

export async function findLastLogByCid(cid: number) {
    const logs = await prisma.revlog.findFirst({
        where: {
            cid,
        },
        orderBy:{
            review:'desc'
        }
    })
    if(!logs){
       return null
    }
    return {
        ...logs,
        rating:logs.grade
    } as unknown as RevlogPrismaUnChecked
}

export async function deleteLogByLid(lid:string){
    const log=await prisma.revlog.delete({
        where:{
            lid
        }
    })
    return log
}

export async function getTodayLearnedNewCardCount(uid:number,startOfDay: Date,source?:string){
    const nextDay = date_scheduler(startOfDay, 1, true);
    let p_count = null
    if(source && source==="lingq"){
        p_count= prisma.
        $queryRaw<{total:bigint}[]>`
            select count(log.cid) as total from Revlog log
            left join Card c on c.cid = log.cid
            left join Note n on n.nid = c.nid
            where n.uid=${Number(uid)} and log.state='0' and log.review between ${startOfDay} and ${nextDay} and n.source=${source}`
    }else{
        p_count= prisma.
        $queryRaw<{total:bigint}[]>`
            select count(log.cid) as total from Revlog log
            left join Card c on c.cid = log.cid
            left join Note n on n.nid = c.nid
            where n.uid=${Number(uid)} and log.state='0' and log.review between ${startOfDay} and ${nextDay}`
    }
    // log.state = State.New
    // get current day new card count
    const p_limit = prisma.$queryRaw<{card_limit:bigint}[]>`
            select card_limit from Parameters where uid=${Number(uid)}`                

    const [count,limit]=await Promise.all([p_count,p_limit])
    return {
        todayCount: Number(count[0].total),
        limit: Number(limit[0].card_limit) ?? 50
    };
}

export type ExportRevLog = {
    card_id:number,
    review_time:number,
    review_rating:Rating,
    review_state:State,
    review_duration?:number
}

export async function exportLogsByUid(uid:number):Promise<ExportRevLog[]>{
    const data= await prisma.$queryRaw<Revlog[]>`
                select log.* from Revlog log
                left join Card c on c.cid = log.cid
                left join Note n on n.nid = c.nid
                where n.uid=${Number(uid)} and c.suspended=${false} order by log.cid`
    return data.map(log => {
        return {
            card_id: log.cid,
            review_time: log.review.getTime(),
            review_rating: Number(log.grade),
            review_state: Number(log.state),
            review_duration: log.duration * 1000
        }
    })
}