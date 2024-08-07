'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { getUserFSRS } from './userParamsService';
import { forgetAfterHandler } from '@/vendor/fsrsToPrisma/handler';
import { CardInput, fixState } from 'ts-fsrs';
import { Card, Prisma } from '@prisma/client';
import {
  addCard,
  deleteCard,
  getCardByCardId,
  getCards,
  updateCard,
} from '@lib/card/retriever';

type CardSimpleInfo = {
  cid: number;
  note: {
    nid: number;
    uid: number;
  };
};

async function findAuthUserCardSimpleInfo<T extends boolean>(
  cid: number,
  includeParams?: T
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const fsrsParamField: Prisma.CardSelect = includeParams
    ? {
        cid: true,
        difficulty: true,
        stability: true,
        due: true,
        last_review: true,
        state: true,
        scheduled_days: true,
        elapsed_days: true,
        reps: true,
        lapses: true,
        note: {
          select: {
            nid: true,
            uid: true,
          },
        },
      }
    : {
        cid: true,
        note: {
          select: {
            nid: true,
            uid: true,
          },
        },
      };

  const cardSimpleInfo = await prisma.card.findUnique({
    where: {
      cid,
    },
    select: fsrsParamField,
  });

  if (!cardSimpleInfo) {
    throw new Error('card not found');
  }
  if (!cardSimpleInfo) {
    notFound();
  }
  if (cardSimpleInfo.note?.uid !== uid) {
    redirect('/denied');
  }
  return cardSimpleInfo as unknown as T extends true
    ? Promise<CardInput & CardSimpleInfo>
    : Promise<CardSimpleInfo>;
}

export async function forgetAction(
  cid: number,
  timestamp: number,
  reset_count: boolean = false
) {
  const cardSimpleInfo = await findAuthUserCardSimpleInfo(cid, true);
  const now = new Date(timestamp);
  const f = await getUserFSRS();
  const recordItem = f.forget(
    cardSimpleInfo,
    now,
    reset_count,
    forgetAfterHandler
  );
  const data = await prisma.card.update({
    where: { cid },
    data: recordItem,
    include: {
      logs: true,
    },
  });
  if (data) {
    revalidatePath(`/note/${data.nid}`);
  }
  return {
    nextState: fixState(recordItem.state),
    nextDue: recordItem.due,
    nid: cardSimpleInfo.note.nid as number,
  };
}

export async function suspendCard(cid: number, suspended: boolean) {
  const cardSimpleInfo = await findAuthUserCardSimpleInfo(cid);
  const data = await prisma.card.update({
    where: { cid: cardSimpleInfo.cid },
    data: {
      suspended,
    },
  });
  if (data) {
    revalidatePath(`/note/${data.nid}`);
  }
  return data;
}

export async function getCardsAction(nid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const note = await getCards(uid, nid);
  return note;
}

export async function getCardByCardIdAction(cid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const note = await getCardByCardId(uid, cid);
  return note;
}

export async function addCardAction(
  nid: number,
  card: Omit<Card, 'nid' | 'deleted' | 'orderId'>
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  return await addCard(uid, nid, card);
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
