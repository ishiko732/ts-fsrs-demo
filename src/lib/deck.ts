import { Card, Note } from "@prisma/client";
import { FSRS, RecordLog, date_scheduler, fsrs, generatorParameters } from "ts-fsrs";
import prisma from "./prisma";
import { State as PrismaState } from "@prisma/client";

abstract class IDeckService {
    abstract getDeck(deckId: number): void;
    abstract getAlgorithm(uid: number): Promise<FSRS>;
    abstract getTodayMemoryContext(uid: number, timezone: string, hourOffset: number): Promise<DeckMemoryState>;


}

abstract class INoteService {
    abstract getNote(nid: number): Note;
    abstract getCard(nid: number): Card;
    abstract schduler(cid: number): void;
    abstract undo(): void;
    abstract rollback(): void;
    abstract edit(nid: number): Note;
    abstract previewRepeat(card: Card): RecordLog;
}


// TODO: get deck notes

export class DeckService implements IDeckService {

    getDeck = (deckId: number) => {
        // TODO: get deck notes
        return {
            deckName: 'deck',
            preLearningTime: new Date().getTime(),
            timezone: 'Asia/Shanghai',
            limit: 50,
        }
    };

    getAlgorithm = async (uid: number) => {
        if (!uid) {
            throw new Error("uid not found");
        }
        const params = await getDBAlgorithmParams(uid)
        return fsrs(params);
    };

    getTodayMemoryContext = async (uid: number, timezone: string, hourOffset: number): Promise<DeckMemoryState> => {
        const clientTime = Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
        const currentDate = new Date(clientTime);
        if (currentDate.getHours() < hourOffset) {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hourOffset, 0, 0, 0);
        const startTimestamp = startOfDay.getTime();
        const nextDay = date_scheduler(startOfDay, 1, true);
        const nextTimestamp = nextDay.getTime();

        const userNewCardlimit = prisma.parameters.findUnique({
            where: {
                uid: uid
            },
            select: {
                card_limit: true
            }
        })
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

        const [_limit, count] = await Promise.all([userNewCardlimit, deckTodayLearnedcount])
        const limit = _limit?.card_limit ?? 50
        const states = [PrismaState.New, PrismaState.Learning, PrismaState.Relearning, PrismaState.Review];

        const notesMemoryTotal = states.map((state) => getNoteMemoryTotal(uid, state, startOfDay, limit, count))
        const noteContext: NoteMemoryContext = Object.create(null);
        for (let i = 0; i < states.length; i++) {
            const state = states[i];
            const total = await notesMemoryTotal[i];
            const pageSize = Math.min(50, total);
            const memoryState = await getNoteMemoryState(uid, state, startOfDay, pageSize);
            noteContext[state] = {
                memoryState,
                pageSize,
                loadPage: 1,
                totalSize: total
            }
        }
        return {
            uid,
            timezone,
            startTimestamp,
            nextTimestamp,
            userNewCardlimit: count,
            deckTodayLearnedcount: limit,
            noteContext: noteContext
        } as DeckMemoryState;
    }


}




// params 
async function getDBAlgorithmParams(uid: number) {
    const params = await prisma.parameters.findUnique({
        where: {
            uid: uid,
        },
        select: {
            request_retention: true,
            maximum_interval: true,
            w: true,
            enable_fuzz: true,
        }
    });
    if (!params) {
        throw new Error(`uid(uid=${uid}) not found`);
    }
    return generatorParameters({
        request_retention: params.request_retention,
        maximum_interval: params.maximum_interval,
        w: JSON.parse(params.w as string),
        enable_fuzz: params.enable_fuzz,
    });
}

// deck
interface DeckMemoryState {
    uid: number;
    timezone: string;
    startTimestamp: number;
    nextTimestamp: number;
    userNewCardlimit: number;
    deckTodayLearnedcount: number;
    noteContext: NoteMemoryContext;
}

interface NoteMemoryState {
    deckId: number;
    noteId: number,
    cardId: number,
    due: number, // due timestamp
}

interface NoteMemoryStatePage {
    memoryState: NoteMemoryState[];
    pageSize: number;
    loadPage: number;
    totalSize: number
}

type NoteMemoryContext = {
    [key in PrismaState]: NoteMemoryStatePage;
};

// note
const MOCK_DECKID = 1;
const CARD_NULL = -1;
const INVALID_DUE = Infinity;
async function getNoteMemoryState(uid: number, state: PrismaState, lte: Date, pageSize: number, page: number = 1) {
    const notes = await prisma.note.findMany({
        where: {
            uid,
            deleted: false,
            card: {
                suspended: false,
                due: state === PrismaState.Review ? { lte: lte } : undefined,
                state,
                deleted: false
            }
        },
        select: {
            nid: true,
            card: {
                select: {
                    cid: true,
                    due: true
                }
            }
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
    });
    return notes.map(note => {
        return {
            deckId: MOCK_DECKID,
            noteId: note.nid,
            cardId: note.card?.cid || CARD_NULL,
            due: note.card?.due?.getTime() || INVALID_DUE,
        }
    }) as NoteMemoryState[];
}

async function getNoteMemoryTotal(uid: number, state: PrismaState, lte: Date, limit: number, todayCount: number) {
    return await prisma.note.count({
        where: {
            uid,
            deleted: false,
            card: {
                suspended: false,
                due: state === PrismaState.Review ? { lte: lte } : undefined,
                state,
                deleted: false
            }
        },
        take: state === PrismaState.New ? Math.max(0, 50 - 0) : undefined,
    });
}