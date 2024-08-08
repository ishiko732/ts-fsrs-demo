import { State as PrismaState } from '@prisma/client';

export const states_prisma = [
  PrismaState.New,
  PrismaState.Learning,
  PrismaState.Relearning,
  PrismaState.Review,
];

export const CARD_NULL = -1;
export const INVALID_DUE = Infinity;
