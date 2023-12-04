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

export async function getTodayLearnedNewCardCount(startOfDay: Date){
    const nextDay = date_scheduler(startOfDay, 1, true);
    const count = await prisma.revlog.count({
      where: {
        review: {
          gte: startOfDay,
          lt: nextDay,
        },
        state: State.New
      },
    }); // get current day new card count
    console.log(count);
    return count;
}