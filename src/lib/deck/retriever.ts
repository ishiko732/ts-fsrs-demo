import 'server-only';
import { generatorParameters } from 'ts-fsrs';
import prisma from '@/lib/prisma';
import { unstable_cache as cache, revalidateTag } from 'next/cache';
import { Deck } from '@prisma/client';
import { State as PrismaState } from '@prisma/client';
import { NoteMemoryState, NoteMomoryStateRequest } from './type';

export const defaultParams = (uid: number) => {
  return {
    did: 0,
    uid: uid,
    name: 'Default',
    fsrs: JSON.stringify(generatorParameters()),
    card_limit: 50,
    lapses: 8,
    extends: JSON.stringify({}),
  } satisfies Omit<Deck, 'deleted'>;
};

export const getParamsByUserId_cache = (uid: number, deckId?: number) => {
  return cache(
    async () => {
      if (deckId === DEFAULT_DECK_ID) {
        return { [DEFAULT_DECK_ID]: defaultParams(uid) };
      }
      const decks: Deck[] = await prisma.deck.findMany({
        where: { uid, did: deckId },
      });
      const resp: Record<string, Omit<Deck, 'deleted'>> = {};
      for (const data of decks) {
        const { deleted, ...rest } = data;
        resp[data.did] = rest;
      }
      resp[`${DEFAULT_DECK_ID}`] = defaultParams(uid);
      return resp;
    },
    [`actions/deck_params/${uid}/deck/${deckId}`],
    {
      tags: [`actions/deck_params/${uid}`],
    }
  ) satisfies () => Promise<Record<string, Omit<Deck, 'deleted'>>>;
};

// crud

export const getDecks = (uid: number) => {
  return cache(
    async () => {
      const decks: Deck[] = await prisma.deck.findMany({
        where: { uid },
      });
      decks.push({
        did: 0,
        uid,
        name: 'Default',
        fsrs: JSON.stringify(generatorParameters()),
        extends: JSON.stringify({}),
        deleted: false,
        card_limit: 50,
        lapses: 8,
      });
      return decks;
    },
    [`actions/decks/${uid}`],
    {
      tags: [`actions/decks/${uid}`],
    }
  ) satisfies () => Promise<Deck[]>;
};

export const addDeck = async (uid: number, deck: Omit<Deck, 'did' | 'uid'>) => {
  return prisma.deck.create({
    data: {
      ...deck,
      fsrs: JSON.stringify(deck.fsrs),
      extends: JSON.stringify(deck.extends),
      uid,
    },
  });
};

export const updateDeck = async (uid: number, deck: Partial<Deck>) => {
  return prisma.deck.update({
    where: { did: deck.did, uid: uid },
    data: {
      ...deck,
      fsrs: deck.fsrs ? JSON.stringify(deck.fsrs) : undefined,
      extends: deck.extends ? JSON.stringify(deck.extends) : undefined,
    },
  });
};

export const deleteDeck = async (
  uid: number,
  deckId: number,
  move: boolean
) => {
  const noteIds = await prisma.note.findMany({
    select: {
      nid: true,
    },
    where: {
      did: deckId,
      uid: uid,
    },
  });
  const res = await prisma.$transaction([
    prisma.deck.update({
      where: { did: deckId, uid },
      data: { deleted: true },
    }),
    prisma.note.updateMany({
      where: { nid: { in: noteIds.map((note) => note.nid) } },
      data: move ? { did: DEFAULT_DECK_ID } : { deleted: true },
    }),
  ]);
  return res.length > 0;
};

export const states_prisma = [
  PrismaState.New,
  PrismaState.Learning,
  PrismaState.Relearning,
  PrismaState.Review,
];
export const DEFAULT_DECK_ID = 0;
const CARD_NULL = -1;
const INVALID_DUE = Infinity;
export async function getNoteMemoryTotal(
  uid: number,
  state: PrismaState,
  lte: Date,
  deckId: number
) {
  return await prisma.note.count({
    where: {
      uid,
      did: deckId,
      deleted: false,
      card: {
        suspended: false,
        due: state === PrismaState.Review ? { lte: lte } : undefined,
        state,
        deleted: false,
      },
    },
  });
}

export async function getNoteMemoryState({
  uid,
  deckId,
  state,
  lte,
  limit,
  todayCount,
  pageSize,
  page = 1,
  ignoreCardIds = [],
}: NoteMomoryStateRequest) {
  const stateNewPageSize =
    state === PrismaState.New
      ? Math.max(0, Math.min(pageSize, limit - todayCount))
      : pageSize;
  const notes = await prisma.note.findMany({
    where: {
      uid,
      did: deckId,
      deleted: false,
      card: {
        suspended: false,
        due: state === PrismaState.Review ? { lte: lte } : undefined,
        state,
        deleted: false,
        cid:
          state === PrismaState.New
            ? undefined
            : {
                notIn: ignoreCardIds,
              },
      },
    },
    select: {
      nid: true,
      did: true,
      card: {
        select: {
          cid: true,
          due: true,
        },
      },
    },
    take: stateNewPageSize,
    skip:
      state === PrismaState.New
        ? (page - 1) * stateNewPageSize
        : (page - 1) * pageSize,
    orderBy: {
      card: {
        difficulty: 'desc',
      },
    },
  });
  return notes.map((note) => {
    return {
      deckId: note.did,
      noteId: note.nid,
      cardId: note.card?.cid || CARD_NULL,
      due: note.card?.due?.getTime() || INVALID_DUE,
    };
  }) as NoteMemoryState[];
}

export async function getNumberOfNewCardsLearnedToday(
  uid: number,
  deckId: number,
  startOfDay: Date,
  nextDay: Date
) {
  return prisma.note.count({
    where: {
      uid: uid,
      did: deckId,
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
      deleted: false,
    },
  });
}
