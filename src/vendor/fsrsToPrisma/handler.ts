import {
  State as PrismaState,
  Rating as PrismaRating,
  Prisma,
} from "@prisma/client";
import {
  Card,
  Grade,
  Grades,
  Rating,
  RecordLog,
  RecordLogItem,
  ReviewLog,
  State,
} from "ts-fsrs";

export interface CardPrismaUnChecked
  extends Omit<Card, "cid" | "nid" | "last_review" | "state"> {
  cid?: number;
  nid?: number;
  last_review: Date | null;
  state: PrismaState;
}

export interface RevlogPrismaUnChecked
  extends Omit<ReviewLog, "cid" | "nid" | "state" | "rating"> {
  lid: string;
  cid: number;
  nid: number;
  state: PrismaState;
  rating: PrismaRating;
}

export interface RepeatRecordLog {
  card: CardPrismaUnChecked;
  log: RevlogPrismaUnChecked;
}

export function cardAfterHandler(card: Card): CardPrismaUnChecked {
  return {
    ...(card as unknown as CardPrismaUnChecked),
    state: State[card.state] as PrismaState,
    last_review: card.last_review ?? null,
  };
}

export function repeatAfterHandler(recordLog: RecordLog) {
  const record: { [key in Grade]: RepeatRecordLog } = {} as {
    [key in Grade]: RepeatRecordLog;
  };
  for (const grade of Grades) {
    record[grade] = {
      card: {
        ...(recordLog[grade].card as Card & { cid: number; nid: number }),
        due: recordLog[grade].card.due,
        state: State[recordLog[grade].card.state] as PrismaState,
        last_review: recordLog[grade].card.last_review ?? null,
      },
      log: {
        ...(recordLog[grade].log as unknown as RevlogPrismaUnChecked),
        state: State[recordLog[grade].log.state] as PrismaState,
        rating: Rating[recordLog[grade].log.rating] as PrismaRating,
      },
    };
  }
  return record;
}


export function rollbackAfterHandler(card: Card):Prisma.XOR<Prisma.CardUpdateInput, Prisma.CardUncheckedUpdateInput>{
    return {
        due: card.due,
        stability: card.stability,
        difficulty: card.difficulty,
        elapsed_days: card.elapsed_days,
        scheduled_days: card.scheduled_days,
        reps: card.reps,
        lapses: card.lapses,
        state: State[card.state] as PrismaState,
        last_review: card.last_review ?? null,
    };
}

export function forgetAfterHandler(
  recordLogItem: RecordLogItem
): Prisma.XOR<Prisma.CardUpdateInput, Prisma.CardUncheckedUpdateInput> {
  return {
    due: recordLogItem.card.due,
    stability: recordLogItem.card.stability,
    difficulty: recordLogItem.card.difficulty,
    elapsed_days: recordLogItem.card.elapsed_days,
    scheduled_days: recordLogItem.card.scheduled_days,
    reps: recordLogItem.card.reps,
    lapses: recordLogItem.card.lapses,
    state: State[recordLogItem.card.state] as PrismaState,
    last_review: recordLogItem.card.last_review ?? null,
    logs: {
      create: {
        grade: Rating[recordLogItem.log.rating] as PrismaRating,
        state: State[recordLogItem.log.state] as PrismaState,
        due: recordLogItem.log.due,
        stability: recordLogItem.log.stability,
        difficulty: recordLogItem.log.difficulty,
        elapsed_days: recordLogItem.log.elapsed_days,
        last_elapsed_days: recordLogItem.log.last_elapsed_days,
        scheduled_days: recordLogItem.log.scheduled_days,
        review: recordLogItem.log.review,
      },
    },
  };
}

export type StateBox = ExcludeReLearning<State>;
// StateBox:
// 0: New
// 1: Learning
// 2: Review

type ExcludeReLearning<T> = Exclude<T, State.Relearning>;
