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
import {
  CARD_NULL,
  DEFAULT_ORDERID,
  INVALID_DUE,
  states_prisma,
} from '@/constant';

export const defaultParams = (uid: number) => {
  return {
    did: DEFAULT_DECK_ID,
    uid: uid,
    name: 'Default',
    fsrs: generatorParameters() as object,
    card_limit: CARDLIMT,
    lapses: LAPSES,
    extends: {},
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
  ) as () => Promise<Record<number, Omit<Deck, 'deleted'>>>;
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
          fsrs: generatorParameters() as object,
          extends: {},
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
  deck: PartialRequired<Omit<Deck, 'extends'>, 'did'>
) => {
  return prisma.deck.update({
    where: { did: deck.did, uid: uid },
    data: {
      ...deck,
      fsrs: deck.fsrs!,
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
  const res: Record<PrismaState, number> = {
    [PrismaState.New]: 0,
    [PrismaState.Learning]: 0,
    [PrismaState.Review]: 0,
    [PrismaState.Relearning]: 0,
  };
  const datum = <{ _count: BigInt; state?: number }[]>await prisma.$queryRaw`
    select count(n.nid) as _count,state 
    from "Note" n left join "Card" c on c.nid=n.nid 
    where n.uid=${uid} and n.did=${deckId} and n.deleted = false
    group by c.state `;
  const stateString: Record<string, PrismaState> = {
    [0]: PrismaState.New,
    [1]: PrismaState.Learning,
    [2]: PrismaState.Review,
    [3]: PrismaState.Relearning,
  };

  for (const data of datum) {
    const state = stateString[`${data.state ?? 0}` as string];
    res[state] += Number(data._count);
  }
  return res;
}

export async function getReviewMemoryTotal(
  uid: number,
  lte: Date,
  deckId: number,
  card_limit: number,
  NewCardsLearnedTodayCount: number
) {
  const new_card_max = Math.max(0, card_limit - NewCardsLearnedTodayCount);
  const count = await prisma.card.groupBy({
    where: {
      OR: [
        {
          suspended: false,
          deleted: false,
          note: {
            uid,
            did: deckId,
            deleted: false,
          },
          state: {
            not: PrismaState.Review,
          },
        },
        {
          suspended: false,
          deleted: false,
          state: PrismaState.Review,
          due: {
            lte,
          },
          note: {
            uid,
            did: deckId,
            deleted: false,
          },
        },
      ],
    },
    by: ['state'],
    _count: true,
  });
  console.log(new Date(lte), lte.getTime(), count);
  const res = {} as Record<PrismaState, number>;
  states_prisma.forEach((state) => {
    res[state] = 0;
  });
  for (const data of count) {
    res[data.state ?? PrismaState.New] += Number(data._count);
  }
  if (res[PrismaState.New] < new_card_max) {
    const note_new = await prisma.note.count({
      where: {
        uid,
        did: deckId,
        deleted: false,
        cards: {
          none: {
            state: {
              in: [
                PrismaState.Review,
                PrismaState.Learning,
                PrismaState.Relearning,
                PrismaState.New,
              ],
            },
          },
        },
      },
      take: new_card_max,
    });
    res[PrismaState.New] += note_new;
  }
  res[PrismaState.New] = Math.min(res[PrismaState.New], new_card_max);
  return res;
}

export async function getReviewMemoryState({
  uid,
  deckId,
  lte,
  total,
  pageSize,
  page = 1,
  ignoreCardIds = [],
}: NoteMomoryStateRequest) {
  const new_card_max = Math.max(0, total[PrismaState.New]);
  const cards = await prisma.card.findMany({
    where: {
      OR: [
        {
          suspended: false,
          deleted: false,
          state: {
            not: PrismaState.Review,
          },
          note: {
            uid,
            did: deckId,
            deleted: false,
          },
        },
        {
          suspended: false,
          deleted: false,
          state: PrismaState.Review,
          due: {
            lte,
          },
          note: {
            uid,
            did: deckId,
            deleted: false,
          },
        },
      ],
      AND: {
        cid: {
          notIn: ignoreCardIds,
        },
      },
    },
    orderBy: {
      state: 'desc',
    },
    select: {
      nid: true,
      cid: true,
      due: true,
      state: true,
      orderId: true,
      note: {
        select: {
          did: true,
        },
      },
    },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });
  const res: NoteMemoryState[] = [];
  const datum = {} as Record<PrismaState, typeof cards>;
  states_prisma.forEach((state) => {
    datum[state] = [];
  });
  for (const data of cards) {
    datum[data.state ?? PrismaState.New].push(data);
  }

  // fill new cards if not enough
  // only fill new cards on the first page
  if (datum[PrismaState.New].length < new_card_max && page === 1) {
    const notes = await prisma.note.findMany({
      where: {
        uid,
        did: deckId,
        deleted: false,
        nid: {
          notIn: datum[PrismaState.New].map((card) => card.nid),
        },
        cards: {
          none: {
            state: {
              in: [
                PrismaState.Review,
                PrismaState.Learning,
                PrismaState.Relearning,
                PrismaState.New,
              ],
            },
          },
        },
      },
      take: Math.max(0, new_card_max - datum[PrismaState.New].length),
    });
    for (const note of notes) {
      res.push({
        deckId: note.did,
        noteId: note.nid,
        cardId: CARD_NULL,
        due: INVALID_DUE,
        state: PrismaState.New,
        orderId: DEFAULT_ORDERID,
      });
    }
  }
  states_prisma.forEach((state) => {
    const processed = datum[state].map((card) => {
      return {
        deckId: card.note.did,
        noteId: card.nid,
        cardId: card.cid || CARD_NULL,
        due: card.due?.getTime() || INVALID_DUE,
        state: card.state,
        orderId: card.orderId,
      } satisfies NoteMemoryState;
    });
    res.push(...processed);
  });
  return res;
}

export async function getNumberOfNewCardsLearnedToday(
  uid: number,
  deckId: number,
  startOfDay: Date,
  nextDay: Date
) {
  return prisma.revlog.count({
    where: {
      uid,
      did: deckId,
      review: {
        gte: startOfDay,
        lt: nextDay,
      },
      state: PrismaState.New,
      deleted: false,
    },
  });
}
