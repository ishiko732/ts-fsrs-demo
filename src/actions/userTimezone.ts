'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import { get_timezones } from '@/lib/date';
import prisma from '@/lib/prisma';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

export async function flushTimezone(timezone: string, hourOffset: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    return { error: 'user not found', success: false };
  }
  const timezones = get_timezones();
  const existed = !!~timezones.indexOf(timezone);
  if (!existed) {
    return { error: 'Timezone not found', success: false };
  }
  const userCacheTimezone = getUserTimeZone_cache(uid);
  const user = await userCacheTimezone();
  if (user?.timezone === timezone && user?.hourOffset === hourOffset % 24) {
    return { success: true };
  }
  revalidateTag(`actions/timezone/${uid}`);
  await prisma.user.update({
    where: { uid },
    data: { timezone, hourOffset: hourOffset % 24 },
  });
  return { success: true };
}

export async function getUserTimeZone() {
  const uid = await getSessionUserId();
  if (!uid) {
    throw { error: 'user not found', success: false };
  }
  const userCacheTimezone = getUserTimeZone_cache(uid);
  const user = await userCacheTimezone();
  return {
    uid: uid!,
    timezone: user?.timezone ?? 'UTC',
    hourOffset: user?.hourOffset ?? 4,
  };
}

const getUserTimeZone_cache = (uid: number) => {
  return cache(
    async () => {
      return await prisma.user.findUnique({
        where: { uid },
        select: { timezone: true, hourOffset: true },
      });
    },
    [`actions/timezone/${uid}`],
    {
      tags: [`actions/timezone/${uid}`],
    }
  );
};
