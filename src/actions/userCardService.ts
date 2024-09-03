'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import prisma from '@/lib/prisma';
import {
  forgetAfterHandler,
  nextAfterHandler,
  RevlogPrismaUnChecked,
  rollbackAfterHandler,
} from '@lib/reviews/card/fsrsToPrisma/handler';
import { fsrs, FSRSParameters, Grade, TypeConvert } from 'ts-fsrs';
import { Card, State } from '@prisma/client';
import {
  addCard,
  deleteCard,
  getCardByCardId,
  getCardByNoteIdAndOrderId,
  getCards,
  updateCard,
} from '@lib/reviews/card/retriever';
import { DeckService } from '@lib/reviews/deck';
import { JsonObject } from '@prisma/client/runtime/library';
import { deckCrud } from '@lib/container';

export async function forgetAction(
  did: number,
  cid: number,
  timestamp: number,
  reset_count: boolean = false
) {
  const card = await getCardByCardIdAction(cid);
  if (!card) {
    throw new Error('card not found');
  }
  const fsrs_params = await new DeckService(did).getAlgorithmParams();
  const f = fsrs(fsrs_params);
  const now = new Date(timestamp);
  const recordItem = f.forget(card, now, reset_count, forgetAfterHandler);
  const data = await prisma.card.update({
    where: { cid },
    data: recordItem,
    include: {
      logs: true,
    },
  });
  return {
    nextState: TypeConvert.state(recordItem.state),
    nextDue: recordItem.due,
    nid: card.nid as number,
  };
}

export async function suspendCard(cid: number, suspended: boolean) {
  const card = await getCardByCardIdAction(cid);
  if (!card) {
    throw new Error('card not found');
  }
  const data = await prisma.card.update({
    where: { cid: card.cid },
    data: {
      suspended,
    },
  });
  return data;
}

export async function schedulerAction(
  did: number,
  cid: number,
  timestamp: number,
  grade: Grade,
  duration: number
) {
  const card = await getCardByCardIdAction(cid);
  if (!card) {
    throw new Error('card not found');
  }
  const deckSvc = new DeckService(did);
  const deck = await deckSvc.getDeck();
  const f = fsrs(deck.fsrs as JsonObject);
  const afterHandler = nextAfterHandler.bind(null, deck.lapses);
  const now = new Date(timestamp);
  const recordItem = f.next(card, now, grade, afterHandler);
  const data = await prisma.card.update({
    where: { cid },
    data: {
      ...recordItem.card,
      logs: {
        create: {
          ...recordItem.logs,
          duration,
          uid: deck.uid,
          did: deck.did,
        },
      },
    },
    include: {
      logs: true,
    },
  });
  return {
    nextState: data.state,
    nextDue: new Date(data.due).getTime(),
    nid: card.nid as number,
    did: did,
  };
}

async function findLastLogByCid(cid: number, deleted: boolean = false) {
  const logs = await prisma.revlog.findFirst({
    where: {
      cid,
      deleted: deleted,
    },
    orderBy: {
      review: 'desc',
    },
  });
  if (!logs) {
    return null;
  }
  return {
    ...logs,
    rating: logs.grade,
  } as unknown as RevlogPrismaUnChecked;
}

export async function rollbackAction(did: number, cid: number) {
  const card = await getCardByCardIdAction(cid);
  const log = await findLastLogByCid(cid);
  if (!card || !log) {
    throw new Error('card/log not found');
  }
  const deckSvc = new DeckService(did);
  const deck = await deckSvc.getDeck();
  const f = fsrs(deck.fsrs as JsonObject);
  const backCard = f.rollback(card, log, rollbackAfterHandler);
  const res = await prisma.card.update({
    where: { cid: card.cid },
    data: {
      ...backCard,
      logs: {
        delete: {
          lid: log.lid,
        },
      },
    },
    include: {
      logs: true,
    },
  });
  return {
    nextState: res.state,
    nextDue: new Date(res.due).getTime(),
    nid: card.nid as number,
    did: did,
  };
}

export async function getCardsAction(nid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const cards = await getCards(uid, nid);
  return cards;
}

export async function getCardByCardIdAction(cid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const card = await getCardByCardId(uid, cid);
  return card;
}

export async function getCardByNoteIdAndOrderIdAction(
  nid: number,
  orderId: number
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const card = await getCardByNoteIdAndOrderId(uid, nid, orderId);
  return card;
}

export async function addCardAction(
  nid: number,
  card: Omit<Card, 'nid' | 'deleted' | 'orderId' | 'uid' | 'cid'>,
  orderId: number = 0
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const existed = await getCardByNoteIdAndOrderId(uid, nid, orderId);
  if (existed) {
    return existed;
  }
  return await addCard(uid, nid, card, orderId);
}

export async function updateCardAction(
  cid: number,
  card: Omit<Card, 'nid' | 'deleted' | 'orderId'>
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await updateCard(uid, cid, card);
  return res;
}

export async function deleteCardAction(cid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await deleteCard(uid, cid, false);
  return res;
}

export async function restoreCardAction(cid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const res = await deleteCard(uid, cid, false);
  return res;
}

// extra

export async function rescheduleAction(deckId: number, cardIds?: number[]) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  // get all card
  const cards = await prisma.card.findMany({
    where: {
      uid: uid,
      note: {
        did: deckId,
      },
      state: State.Review,
      cid: {
        in: cardIds?.length ? cardIds : undefined,
      },
    },
    orderBy: {
      last_review: 'asc',
    },
  });

  const params = (await deckCrud.get(deckId)).fsrs as unknown as FSRSParameters;

  return _reschedule(params, cards);
}

async function _reschedule(parameters: FSRSParameters, cards: Card[]) {
  if (cards.length === 0) {
    return false;
  }
  const f = fsrs(parameters);
  const rescheduled_cards = f.reschedule(cards);
  if (rescheduled_cards.length === 0) {
    return true;
  }
  console.time(`reschedule`);
  await prisma.$transaction(
    rescheduled_cards.map((data) =>
      prisma.card.update({
        where: { cid: data.cid },
        data: data,
      })
    )
  );
  console.timeEnd(`reschedule`);
  console.time(`reschedule: ${rescheduled_cards.length}cards`);
  return true;
}
