import {
  date_scheduler,
  fsrs,
  FSRSParameters,
} from 'ts-fsrs';
import prisma from '../prisma';
import { State as PrismaState } from '@prisma/client';
import {
  DeckMemoryContext,
  IDeckService,
  NoteMemoryContext,
  NoteMemoryState,
  SearchTodayMemoryContextPage,
} from './type';
import { getParamsByUserId } from '@actions/userDeckService';

// TODO: get deck notes
const states = [
  PrismaState.New,
  PrismaState.Learning,
  PrismaState.Relearning,
  PrismaState.Review,
];
const memoryPageSize = 50;

export class DeckService implements IDeckService {
  getDeck = (deckId: number) => {
    // TODO: get deck notes
    return {
      deckName: 'deck',
      preLearningTime: new Date().getTime(),
      timezone: 'Asia/Shanghai',
      limit: 50,
    };
  };

  getAlgorithmParams = async (uid: number, deckId: number = 0) => {
    if (!uid) {
      throw new Error('uid not found');
    }
    const params = await getParamsByUserId(uid);
    if (!params[deckId]) {
      deckId = 0;
    }
    return JSON.parse(params[deckId].fsrs as string) as FSRSParameters;
  };

  getAlgorithm = async (uid: number) => {
    const params = await this.getAlgorithmParams(uid);
    return fsrs(params);
  };

  getTodayMemoryContext = async (
    uid: number,
    timezone: string,
    hourOffset: number
  ): Promise<DeckMemoryContext> => {
    const clientTime = Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
    }).format(new Date());
    let currentDate = new Date(clientTime);
    if (currentDate.getHours() < hourOffset) {
      currentDate = date_scheduler(currentDate, -1, true);
    }
    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hourOffset,
      0,
      0,
      0
    );
    const startTimestamp = startOfDay.getTime();
    const nextDay = date_scheduler(startOfDay, 1, true);
    const nextTimestamp = nextDay.getTime();

    const userNewCardlimit = prisma.parameters.findUnique({
      where: {
        uid: uid,
      },
      select: {
        card_limit: true,
      },
    });
    const deckTodayLearnedcount = prisma.note.count({
      where: {
        uid: uid,
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

    const [_limit, count] = await Promise.all([
      userNewCardlimit,
      deckTodayLearnedcount,
    ]);
    const limit =
      _limit?.card_limit !== undefined ? _limit?.card_limit : memoryPageSize;

    const notesMemoryTotal = states.map((state) =>
      getNoteMemoryTotal(uid, state, startOfDay, limit, count)
    );
    const noteContext: NoteMemoryContext = Object.create(null);
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      const total = await notesMemoryTotal[i];
      const pageSize = Math.min(memoryPageSize, total);
      const memoryState = await getNoteMemoryState({
        uid,
        state,
        lte: startOfDay,
        limit,
        todayCount: count,
        pageSize,
      });
      noteContext[state] = {
        memoryState,
        pageSize,
        loadPage: 1,
        totalSize: total,
      };
    }
    return {
      uid,
      timezone,
      startTimestamp,
      nextTimestamp,
      userNewCardlimit: limit,
      deckTodayLearnedcount: count,
      noteContext: noteContext,
    } as DeckMemoryContext;
  };

  todayMemoryContextPage = async ({
    uid,
    startTimestamp,
    userNewCardlimit,
    deckTodayLearnedcount,
    page,
    ignoreCardIds,
  }: SearchTodayMemoryContextPage): Promise<NoteMemoryContext> => {
    if ((page ?? 0) < 1) {
      throw new Error('page must be greater than 0');
    }
    const notesMemoryTotal = states.map((state) =>
      getNoteMemoryTotal(
        uid,
        state,
        new Date(startTimestamp),
        userNewCardlimit,
        deckTodayLearnedcount
      )
    );
    const noteContext: NoteMemoryContext = Object.create(null);
    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      const total = await notesMemoryTotal[i];
      const pageSize = Math.min(memoryPageSize, total);
      const memoryState = await getNoteMemoryState({
        uid,
        state,
        lte: new Date(startTimestamp),
        limit: userNewCardlimit,
        todayCount: deckTodayLearnedcount,
        pageSize,
        page,
        ignoreCardIds,
      });
      noteContext[state] = {
        memoryState,
        pageSize,
        loadPage: page!,
        totalSize: total,
      };
    }
    return noteContext;
  };
}

// note
const MOCK_DECKID = 1;
const CARD_NULL = -1;
const INVALID_DUE = Infinity;
async function getNoteMemoryState({
  uid,
  state,
  lte,
  limit,
  todayCount,
  pageSize,
  page = 1,
  ignoreCardIds = [],
}: {
  uid: number;
  state: PrismaState;
  lte: Date;
  limit: number;
  todayCount: number;
  pageSize: number;
  page?: number;
  ignoreCardIds?: number[];
}) {
  const stateNewPageSize =
    state === PrismaState.New
      ? Math.max(0, Math.min(pageSize, limit - todayCount))
      : pageSize;
  const notes = await prisma.note.findMany({
    where: {
      uid,
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
      card: {
        select: {
          cid: true,
          due: true,
        },
      },
    },
    take: stateNewPageSize,
    skip: state === PrismaState.New ? stateNewPageSize : (page - 1) * pageSize,
    orderBy: {
      card: {
        difficulty: 'desc',
      },
    },
  });
  return notes.map((note) => {
    return {
      deckId: MOCK_DECKID,
      noteId: note.nid,
      cardId: note.card?.cid || CARD_NULL,
      due: note.card?.due?.getTime() || INVALID_DUE,
    };
  }) as NoteMemoryState[];
}

async function getNoteMemoryTotal(
  uid: number,
  state: PrismaState,
  lte: Date,
  limit: number,
  todayCount: number
) {
  return await prisma.note.count({
    where: {
      uid,
      deleted: false,
      card: {
        suspended: false,
        due: state === PrismaState.Review ? { lte: lte } : undefined,
        state,
        deleted: false,
      },
    },
    take:
      state === PrismaState.New ? Math.max(0, limit - todayCount) : undefined,
  });
}
