'use server';

import { getSessionUserId } from '@auth/session';
import { decryptKey, encryptKey } from '@lib/crypt';
import prisma from '@lib/prisma';

export async function getKeyAction(key: string, counter: string) {
  return decryptKey(key, counter);
}

export async function setKeyAction(key: string) {
  return encryptKey(key);
}

export async function getNotExistSourceIds(
  deckId: number,
  source: string,
  sourceIds: string[]
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const existSourceIds = await prisma.note.findMany({
    where: {
      did: deckId,
      uid: uid,
      source: source,
      sourceId: {
        in: sourceIds,
      },
    },
    select: {
      sourceId: true,
    },
  });
  const existPks = existSourceIds
    .filter((note) => note.sourceId)
    .map((note) => note.sourceId);
  const nonExistPks = sourceIds.filter((pk) => !existPks.includes(pk));
  return nonExistPks;
}
