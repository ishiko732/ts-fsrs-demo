'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import { get_timezones } from '@/lib/date';
import prisma from '@/lib/prisma';

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
  const user = await prisma.user.findUnique({
    where: { uid },
    select: { timezone: true, hourOffset: true },
  });
  return {
    uid: uid!,
    timezone: user?.timezone ?? 'UTC',
    hourOffset: user?.hourOffset ?? 4,
  };
}
