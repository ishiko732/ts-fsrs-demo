import { State as PrismaState } from "@prisma/client";
import prisma from "./prisma";
import { Rating, State, date_scheduler, fixRating, fixState } from "ts-fsrs";
import { RevlogPrismaUnChecked } from "@lib/reviews/card/fsrsToPrisma/handler";

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