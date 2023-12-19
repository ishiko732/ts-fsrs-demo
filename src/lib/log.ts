import { Card, Note, Prisma,Revlog, State } from "@prisma/client";
import prisma from "./prisma";
import { date_scheduler } from "ts-fsrs";

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
    return logs
}

export async function deleteLogByLid(lid:string){
    const log=await prisma.revlog.delete({
        where:{
            lid
        }
    })
    return log
}

export async function getTodayLearnedNewCardCount(uid:number,startOfDay: Date){
    const nextDay = date_scheduler(startOfDay, 1, true);
    const count =await prisma.
        $queryRaw<{total:bigint}[]>`
            select count(lid) as total from revlog
            where review >= ${startOfDay} and review < ${nextDay} and 
            cid in 
                (select cid from card where nid in 
                                                (select nid from note where note.uid=${Number(uid)}))`
    // get current day new card count
    return Number(count[0].total);
}