'use server';
import { State as PrismaState } from '@prisma/client';
import prisma from '@lib/prisma';
import { Rating, State, TypeConvert } from 'ts-fsrs';
import { getSessionUserId } from '@auth/session';

export async function findLogsByCid(cid: number, deleted: boolean = false) {
  const logs = await prisma.revlog.findMany({
    where: {
      cid,
      deleted: deleted,
    },
    orderBy: {
      review: 'desc',
    },
  });
  return logs;
}

type ExportRevLog = {
  card_id: number;
  review_time: number;
  review_rating: Rating;
  review_state: RevLogState;
  review_duration?: number;
};

// fsrs-rs#182:https://github.com/open-spaced-repetition/fsrs-rs/pull/182
// https://github.com/open-spaced-repetition/fsrs-rs/blob/64b5f518cff07051228461d4275f9501382a4ae3/src/convertor_tests.rs#L38-L47
enum RevLogState {
  Learning = 0,
  Review = 1,
  Relearning = 2,
  Filtered = 3,
  Manual = 4,
}

function to_revlogState(state: PrismaState) {
  const fsrsState = TypeConvert.state(state);
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

export async function exportLogsAction(
  deckId?: number
): Promise<ExportRevLog[]> {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const data = await prisma.revlog.findMany({
    where: {
      uid: uid,
      did: deckId,
      deleted: false,
      card: {
        deleted: false,
        suspended: false,
      },
    },
    orderBy: {
      cid: 'asc',
    },
  });
  const resp = (data ?? []).map((log) => {
    return {
      card_id: log.cid,
      review_time: log.review.getTime(),
      review_rating: TypeConvert.rating(log.grade),
      review_state: to_revlogState(log.state),
      review_duration: log.duration * 1000,
    };
  });
  return resp;
}
