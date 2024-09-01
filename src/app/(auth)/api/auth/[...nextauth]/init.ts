import prisma from '@/lib/prisma';
import {
  default_enable_fuzz,
  default_maximum_interval,
  default_request_retention,
  default_w,
} from 'ts-fsrs';
import progeigo from '@/../public/プログラミング必須英単語600+.json' assert { type: 'json' };
import { initProgeigoNotes } from '@/lib/note';
import { ProgeigoNodeData, UserCreatedRequired } from '@/types';
import { getUserByEmail, getUserByOauthId } from '@/lib/user';
import { User } from '@prisma/client';

// init user and fsrs config
export async function initUserAndFSRS(
  profile: UserCreatedRequired
): Promise<User> {
  const user = await prisma.user.create({
    data: {
      name: profile.name,
      password: profile.password,
      email: profile.email,
      oauthId: profile.oauthId,
      oauthType: profile.oauthType,
    },
  });
  if (!user) {
    throw new Error('Failed to create user');
  }
  return user;
}

// init progeigo dates
export async function initProgeigoDates(uid: number) {
  console.log('init dates');
  const dates: ProgeigoNodeData[] = progeigo.data.英単語.map(
    (node) => node.data
  ) as ProgeigoNodeData[];

  return initProgeigoNotes(uid, 0, dates.slice(0, 60));
}

// find or init user
export async function initUser(profile: UserCreatedRequired) {
  let user: User | null = null;
  if (profile.oauthType) {
    user = await getUserByOauthId({
      oauthId: profile.oauthId,
      oauthType: profile.oauthType,
    });
  } else {
    user = await getUserByEmail(profile.email);
  }
  if (!user) {
    user = await initUserAndFSRS(profile);
    await initProgeigoDates(user.uid);
  }
  return user;
}
