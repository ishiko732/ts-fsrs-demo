import 'server-only';
import { generatorParameters, State } from 'ts-fsrs';
import prisma from '@/lib/prisma';
import { unstable_cache as cache, revalidateTag } from 'next/cache';
import { Deck } from '@prisma/client';
import { State as PrismaState } from '@prisma/client';
import {
  NoteMemoryState,
  NoteMomoryStateRequest,
  PartialRequired,
} from '../type';
import { CARDLIMT, DEFAULT_DECK_ID, LAPSES } from '@/constant/deck';
import { CARD_NULL, INVALID_DUE } from '@/constant';

export const defaultParams = (uid: number) => {
  return {
    did: DEFAULT_DECK_ID,
    uid: uid,
    name: 'Default',
    fsrs: JSON.stringify(generatorParameters()),
    card_limit: CARDLIMT,
    lapses: LAPSES,
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

export const getDecks = (uid: number, deleted?: boolean) => {
  return cache(
    async () => {
      const decks: Deck[] = await prisma.deck.findMany({
        where: { uid, deleted },
        orderBy: {
          did: 'desc',
        },
      });
      if (!deleted) {
        decks.push({
          did: DEFAULT_DECK_ID,
          uid,
          name: 'Default',
          fsrs: JSON.stringify(generatorParameters()),
          extends: JSON.stringify({}),
          deleted: false,
          card_limit: CARDLIMT,
          lapses: LAPSES,
        });
      }
      return decks;
    },
    [`actions/decks/${uid}/deleted/${deleted ? 1 : 0}`],
    {
      tags: [`actions/decks/${uid}/deleted/${deleted ? 1 : 0}`],
    }
  ) satisfies () => Promise<Deck[]>;
};

export const addDeck = async (uid: number, deck: Omit<Deck, 'did' | 'uid'>) => {
  return prisma.deck.create({
    data: {
      ...deck,
      fsrs: deck.fsrs!,
      extends: deck.extends!,
      uid,
    },
  });
};

export const updateDeck = async (
  uid: number,
  deck: PartialRequired<Deck, 'did'>
) => {
  return prisma.deck.update({
    where: { did: deck.did, uid: uid },
    data: {
      ...deck,
      fsrs: deck.fsrs!,
      extends: deck.extends!,
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

export const restoreDeck = async (uid: number, deckId: number) => {
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
      data: { deleted: false },
    }),
    prisma.note.updateMany({
      where: { nid: { in: noteIds.map((note) => note.nid) } },
      data: { deleted: false },
    }),
  ]);
  return res.length > 0;
};

export async function getNoteTotalGroupByDeckId(uid: number, deckId?: number) {
  return await prisma.card.groupBy({
    where: {
      deleted: false,
      note: {
        uid: uid,
        did: deckId,
      },
    },
    by: ['state'],
    _count: true,
  });
}

export async function getNoteMemoryTotal(
  uid: number,
  state: PrismaState,
  lte: Date,
  deckId: number,
  card_limit: number,
  NewCardsLearnedTodayCount: number
) {
  return await prisma.note.count({
    where: {
      uid,
      did: deckId,
      deleted: false,
      cards: {
        some: {
          suspended: false,
          due: state === PrismaState.Review ? { lte: lte } : undefined,
          state,
          deleted: false,
        },
      },
    },
    take:
      state === PrismaState.New
        ? Math.max(0, card_limit - NewCardsLearnedTodayCount)
        : undefined,
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
      cards: {
        some: {
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
    },
    select: {
      nid: true,
      did: true,
      cards: {
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
    // orderBy: {
    //   cards: {
    //     difficulty: 'desc',
    //   },
    // },
  });
  return notes.map((note) => {
    return {
      deckId: note.did,
      noteId: note.nid,
      cardId: note.cards?.[0].cid || CARD_NULL,
      due: note.cards?.[0].due?.getTime() || INVALID_DUE,
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
      cards: {
        some: {
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
      },
      deleted: false,
    },
  });
}
