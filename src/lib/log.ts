import prisma from "./prisma";
import { date_scheduler, formatDate } from "ts-fsrs";

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
    const firstTime = startOfDay;
    const endTIme = nextDay;
    const p_count =prisma.
        $queryRawUnsafe<{total:bigint}[]>(`
            select count(log.cid)::int as total from Revlog log
            left join Card c on c.cid = log.cid
            left join Note n on n.nid = c.nid
            where n.uid=$1 and log.state='0' and log.review between $2 and $3`,Number(uid),firstTime,endTIme)
    // log.state = State.New
    // get current day new card count
    const p_limit = prisma.$queryRaw<{card_limit:bigint}[]>`
            select card_limit::int from Parameters where uid=${Number(uid)}`                

    const [count,limit]=await Promise.all([p_count,p_limit])
    return {
        todayCount: Number(count[0].total),
        limit: Number(limit[0].card_limit) ?? 50
    };
}