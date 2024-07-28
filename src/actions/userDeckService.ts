'use server';
import 'server-only';
import { getSessionUserId } from '@auth/session';
import {
  getNoteMemoryState,
  getNoteMemoryTotal,
  getParamsByUserId_cache,
  states_prisma,
} from '@lib/deck/retriever';
import { getNumberOfNewCardsLearnedToday } from '@lib/deck/retriever';
import { Deck, State as PrismaState } from '@prisma/client';
import { NoteMemoryState, NoteMemoryStatePage } from '@lib/deck/type';

export async function getParamsByUserIdAction(deckId: number = 0) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const get = getParamsByUserId_cache(uid, deckId);
  return await get();
}

export async function getNumberOfNewCardsLearnedTodayAction(
  deckId: number = 0,
  startTimestamp: number,
  endTimestamp: number
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);
  return await getNumberOfNewCardsLearnedToday(uid, deckId, start, end);
}

export async function getNoteMemoryTotalAction(
  did: number,
  startTimestamp: number,
  limit: number,
  count: number
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const start = new Date(startTimestamp);
  const res = {} as Record<PrismaState, number>;
  await Promise.all( states_prisma.map(
    async (state) =>
      (res[state] = await getNoteMemoryTotal(
        uid,
        state,
        start,
        limit,
        count,
        did
      ))
  ))
  return res;
}

export async function getNoteMemoryContextAction(
  deckId: number,
  state: PrismaState,
  startTimestamp: number,
  limit: number,
  todayCount: number,
  pageSize: number,
  page: number = 1,
  ignoreCardIds?: number[]
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const start = new Date(startTimestamp);
  const total = await getNoteMemoryTotal(
    uid,
    state,
    start,
    limit,
    todayCount,
    deckId
  );
  const size = Math.min(pageSize, total);
  const noteMemoryStates = await getNoteMemoryState({
    uid,
    deckId,
    state,
    lte: start,
    limit,
    todayCount,
    pageSize: size,
    page,
    ignoreCardIds,
  });

  return {
    memoryState: noteMemoryStates,
    pageSize: size,
    loadPage: page,
    totalSize: total,
  } satisfies NoteMemoryStatePage;
}
