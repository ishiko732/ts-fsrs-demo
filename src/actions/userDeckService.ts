'use server';
import 'server-only';
import { getSessionUserId } from '@auth/session';
import {
  addDeck,
  deleteDeck,
  getDecks,
  getReviewMemoryState,
  getReviewMemoryTotal,
  getNoteTotalGroupByDeckId,
  getParamsByUserId_cache,
  restoreDeck,
  updateDeck,
} from '@lib/reviews/deck/retriever';
import { getNumberOfNewCardsLearnedToday } from '@lib/reviews/deck/retriever';
import { Deck, State as PrismaState } from '@prisma/client';
import { NoteMemoryContext } from '@lib/reviews/type';
import { revalidatePath, revalidateTag } from 'next/cache';

// Deck Crud

export async function getDecksAction(deleted?: boolean) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const data = getDecks(uid, deleted)();

  return data;
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
  revalidateTag(`actions/decks/${uid}/deleted/1`);
  revalidateTag(`actions/decks/${uid}/deleted/0`);
  return res;
}

export async function updateDeckAction(
  deck: Omit<Deck, 'uid' | 'deleted' | 'extends'>
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await updateDeck(uid, { ...deck, deleted: false });
  revalidateTag(`actions/decks/${uid}/deleted/1`);
  revalidateTag(`actions/decks/${uid}/deleted/0`);
  revalidateTag(`actions/deck_params/${uid}`);
  return res;
}

export async function deleteDeckAction(did: number, move: boolean) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await deleteDeck(uid, did, move);
  revalidateTag(`actions/decks/${uid}/deleted/1`);
  revalidateTag(`actions/decks/${uid}/deleted/0`);
  revalidateTag(`actions/deck_params/${uid}`);
  return res;
}

export async function restoreDeckAction(did: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await restoreDeck(uid, did);
  revalidateTag(`actions/decks/${uid}/deleted/1`);
  revalidateTag(`actions/decks/${uid}/deleted/0`);
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
  startTimestamp: number,
  nextTimestamp: number
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const start = new Date(startTimestamp);
  const count = await getNumberOfNewCardsLearnedTodayAction(
    did,
    startTimestamp,
    nextTimestamp
  );
  const decks = await getParamsByUserId_cache(uid, did)();
  const deck = decks[did];
  const res = await getReviewMemoryTotal(
    uid,
    start,
    did,
    deck.card_limit,
    count
  );
  return res;
}

export async function getReviewMemoryContextAction(
  deckId: number,
  startTimestamp: number,
  nextTimestamp: number,
  pageSize: number,
  page: number = 1,
  ignoreCardIds?: number[]
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const start = new Date(startTimestamp);
  const count = await getNumberOfNewCardsLearnedTodayAction(
    deckId,
    startTimestamp,
    nextTimestamp
  );
  const deck = await getParamsByUserId_cache(uid, deckId)();
  const total = await getReviewMemoryTotal(
    uid,
    start,
    deckId,
    deck[deckId].card_limit,
    count
  );
  const noteMemoryStates = await getReviewMemoryState({
    uid,
    deckId,
    lte: start,
    total,
    pageSize: pageSize,
    page,
    ignoreCardIds,
  });

  return {
    memoryState: noteMemoryStates,
    pageSize: noteMemoryStates.length,
    loadPage: page,
    totalSize: total,
  } satisfies NoteMemoryContext;
}

export async function getNoteTotalGroupAction(deckId?: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const datum = await getNoteTotalGroupByDeckId(uid, deckId);
  return datum;
}
