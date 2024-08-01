'use server';
import 'server-only';
import { getSessionUserId } from '@auth/session';
import {
  addDeck,
  deleteDeck,
  getDecks,
  getNoteMemoryState,
  getNoteMemoryTotal,
  getParamsByUserId_cache,
  states_prisma,
  updateDeck,
} from '@lib/deck/retriever';
import { getNumberOfNewCardsLearnedToday } from '@lib/deck/retriever';
import { Deck, State as PrismaState } from '@prisma/client';
import { NoteMemoryStatePage } from '@lib/deck/type';
import { revalidateTag } from 'next/cache';

// Deck Crud

export async function getDecksAction() {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const get = getDecks(uid);

  return await get();
}

export async function addDeckAction(
  deck: Omit<Deck, 'uid' | 'did' | 'deleted'>
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  Reflect.set(deck, 'did', undefined);
  // @ts-ignore
  delete deck.did;
  const res = await addDeck(uid, { ...deck, deleted: false });
  revalidateTag(`actions/decks/${uid}`);
  return res;
}

export async function updateDeckAction(deck: Omit<Deck, 'uid' | 'deleted'>) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await updateDeck(uid, { ...deck, deleted: false });
  revalidateTag(`actions/decks/${uid}`);
  revalidateTag(`actions/deck_params/${uid}`);
  return res;
}

export async function deleteDeckAction(did: number, move: boolean) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await deleteDeck(uid, did, move);
  revalidateTag(`actions/decks/${uid}`);
  revalidateTag(`actions/deck_params/${uid}`);
  return res;
}

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
  startTimestamp: number
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const start = new Date(startTimestamp);
  const res = {} as Record<PrismaState, number>;
  await Promise.all(
    states_prisma.map(
      async (state) =>
        (res[state] = await getNoteMemoryTotal(uid, state, start, did))
    )
  );
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
  const total = await getNoteMemoryTotal(uid, state, start, deckId);
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