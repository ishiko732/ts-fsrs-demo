import { State as PrismaState } from "@prisma/client";
import prisma from "./prisma";
import { Rating, State, date_scheduler, fixRating, fixState } from "ts-fsrs";
import { RevlogPrismaUnChecked } from "@/vendor/fsrsToPrisma/handler";

export async function findLogsByCid(cid: number, deleted: boolean = false) {
    const logs = await prisma.revlog.findMany({
        where: {
            cid,
            deleted: deleted
        },
        orderBy: {
            review: 'desc'
        }
    })
    return logs
}

export async function findLastLogByCid(cid: number,deleted: boolean = false) {
    const logs = await prisma.revlog.findFirst({
        where: {
            cid,
            deleted: deleted
        },
        orderBy: {
            review: 'desc'
        }
    })
    if (!logs) {
        return null
    }
    return {
        ...logs,
        rating: logs.grade
    } as unknown as RevlogPrismaUnChecked
}

export async function deleteLogByLid(lid: string,deleted: boolean = false) {
    const log = await prisma.revlog.delete({
        where: {
            lid,
            deleted: deleted
        }
    })
    return log
}

export async function getTodayLearnedNewCardCount(uid: number, startOfDay: Date, source?: string) {
    const nextDay = date_scheduler(startOfDay, 1, true);
    // let p_count = null
    // if (source && source === "lingq") {
    //     p_count = prisma.
    //         $queryRaw<{ total: bigint }[]>`
    //         select count(log.cid) as total from "Revlog" log
    //         left join "Card" c on c.cid = log.cid
    //         left join "Note" n on n.nid = c.nid
    //         where n.uid=${Number(uid)} and log.state='0' and log.review between ${startOfDay} and ${nextDay} and n.source=${source} and log.deleted=${false}`
    // } else {
    //     p_count = prisma.
    //         $queryRaw<{ total: bigint }[]>`
    //         select count(log.cid) as total from "Revlog" log
    //         left join "Card" c on c.cid = log.cid
    //         left join "Note" n on n.nid = c.nid
    //         where n.uid=${Number(uid)} and log.state='0' and log.review between ${startOfDay} and ${nextDay} and log.deleted=${false}`
    // }

    const p_count = prisma.note.count({
      where: {
        uid: uid,
        card: {
          logs: {
            some: {
              review: {
                gte: startOfDay,
                lt: nextDay,
              },
              state: PrismaState.New,
              deleted: false,
            },
          },
          deleted: false,
        },
        source: source && source === "lingq" ? "lingq" : undefined,
        deleted: false,
      },
    });
    // log.state = State.New
    // get current day new card count
    const p_limit = prisma.parameters.findUnique({
        where: {
            uid: uid
        },
        select:{
            card_limit:true
        }
    })

    const [count, limit] = await Promise.all([p_count, p_limit])
    return {
      todayCount: count,
      limit: limit?.card_limit ?? 50,
    };
}

export type ExportRevLog = {
    card_id: number,
    review_time: number,
    review_rating: Rating,
    review_state: RevLogState,
    review_duration?: number
}

// fsrs-rs#182:https://github.com/open-spaced-repetition/fsrs-rs/pull/182
// https://github.com/open-spaced-repetition/fsrs-rs/blob/64b5f518cff07051228461d4275f9501382a4ae3/src/convertor_tests.rs#L38-L47
export enum RevLogState {
  Learning = 0,
  Review = 1,
  Relearning = 2,
  Filtered = 3,
  Manual = 4
}

function to_revlogState(state:PrismaState){
  const fsrsState = fixState(state);
  switch (fsrsState) {
      case State.New:
      case State.Learning:
          return RevLogState.Learning;
      case State.Relearning:
          return RevLogState.Relearning;
      case State.Review:
          return RevLogState.Review;
  }
}

export async function exportLogsByUid(uid: number): Promise<ExportRevLog[]> {
    const data = await prisma.revlog.findMany({
      where: {
        card: {
          note: {
            uid: uid,
            deleted: false,
          },
          deleted: false,
          suspended: false,
        },
      },
      orderBy: {
        cid: "asc",
      },
    });
    return data.map(log => {
        return {
            card_id: log.cid,
            review_time: log.review.getTime(),
            review_rating: fixRating(log.grade),
            review_state: to_revlogState(log.state),
            review_duration: Math.max(log.duration, 60) * 1000
        }
    })
}