'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import { exportLogsByUid } from '@/lib/log';
import { addRevlog, getRevlogs } from '@lib/revlog/retriever';
import { Revlog } from '@prisma/client';

export async function exportLogs() {
  const uid = await getSessionUserId();
  if (!uid) {
    return [];
  }
  return await exportLogsByUid(uid);
}

export async function getLogsAction(cid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const note = await getRevlogs(uid, cid);
  return note;
}

export async function adLogAction(
  cid: number,
  log: Omit<Revlog, 'cid' | 'deleted'>
) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  return await addRevlog(uid, cid, log);
}
