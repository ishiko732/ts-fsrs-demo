import { State as PrismaState } from '@prisma/client';

export const states_prisma = [
  PrismaState.New,
  PrismaState.Learning,
  PrismaState.Relearning,
  PrismaState.Review,
];

export type StateBox = Exclude<PrismaState, 'Relearning'>;
// StateBox:
// 0: New
// 1: Learning
// 2: Review

export const CARD_NULL = 0;
export const INVALID_DUE = Infinity;
export const DEFAULT_ORDERID = 0;
