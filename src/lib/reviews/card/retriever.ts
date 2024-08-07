import 'server-only';
import prisma from '@lib/prisma';
import { Card } from '@prisma/client';

// crud
export const getCards = async (uid: number, nid: number): Promise<Card[]> => {
  return prisma.card.findMany({
    where: {
      nid,
      uid,
    },
  });
};

export const getCardByCardId = async (
  uid: number,
  cid: number
): Promise<Card> => {
  return prisma.card.findFirstOrThrow({
    where: {
      cid,
      uid,
    },
  });
};

export const addCard = async (
  uid: number,
  nid: number,
  card: Omit<Card, 'nid' | 'deleted' | 'orderId'>,
  orderId: number = 0
) => {
  return prisma.card.create({
    data: {
      ...card,
      uid,
      nid,
      deleted: false,
      orderId: orderId,
    },
  });
};

export const updateCard = async (
  uid: number,
  cid: number,
  card: Omit<Card, 'nid' | 'deleted' | 'orderId'>
) => {
  return prisma.card.update({
    where: { cid, uid },
    data: {
      ...card,
      deleted: undefined,
      orderId: undefined,
    },
  });
};

export const deleteCard = async (
  uid: number,
  cid: number,
  restore?: boolean
) => {
  const logIds = await prisma.revlog.findMany({
    select: {
      lid: true,
    },
    where: {
      cid: cid,
      uid: uid,
    },
  });
  const res = await prisma.$transaction([
    prisma.card.update({
      where: { cid },
      data: { deleted: restore ? false : true },
    }),
    prisma.revlog.updateMany({
      where: { lid: { in: logIds.map((card) => card.lid) } },
      data: { deleted: restore ? false : true },
    }),
  ]);
  return res.length > 0;
};
