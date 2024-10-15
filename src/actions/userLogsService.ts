'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import { addRevlog, getRevlogs } from '@lib/reviews/revlog/retriever';
import { Revlog } from '@prisma/client';

export async function getLogsAction(cid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const logs = await getRevlogs(uid, cid);
  return logs;
}

export async function addLogAction(
  cid: number,
  log: Omit<Revlog, 'cid' | 'deleted'>
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  return await addRevlog(uid, cid, log);
}
