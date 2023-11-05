import { Card, Note, Prisma,Revlog } from "@prisma/client";
import prisma from "./prisma";

export async function findLogsByCid(cid: number) {
    const logs = await prisma.revlog.findMany({
        where: {
            cid,
        },
    })
    return logs
}