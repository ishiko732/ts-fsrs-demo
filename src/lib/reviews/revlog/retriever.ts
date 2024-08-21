import 'server-only';
import prisma from '@lib/prisma';
import { Revlog } from '@prisma/client';

// crud
export const getRevlogs = async (
  uid: number,
  cid: number
): Promise<Revlog[]> => {
  return prisma.revlog.findMany({
    where: {
      uid,
      cid,
    },
    orderBy: {
      review: 'desc',
    },
  });
};

export const addRevlog = async (
  uid: number,
  cid: number,
  log: Omit<Revlog, 'cid' | 'deleted'>
) => {
  return prisma.revlog.create({
    data: {
      ...log,
      deleted: false,
      uid,
      cid,
    },
  });
};
