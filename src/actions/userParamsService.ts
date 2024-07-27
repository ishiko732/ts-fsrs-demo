'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import {
  ParametersType,
  getFSRSParamsByUid,
  updateParameters,
} from '@/lib/fsrs';
import { unstable_cache as cache, revalidateTag } from 'next/cache';
import { fsrs } from 'ts-fsrs';
type IRespose = {
  code: number;
  msg: string;
  data: null | ParametersType;
};

export async function getUserParams() {
  const uid = await getSessionUserId();
  if (!uid) {
    return { code: 401, msg: 'user not found.', data: null } as IRespose;
  }
  const userCacheParams = getUserParams_cache(uid);
  try {
    return {
      code: 200,
      msg: 'success',
      data: await userCacheParams(),
    } as IRespose;
  } catch (e: any) {
    return { code: 500, msg: (e as Error).message, data: null } as IRespose;
  }
}

// Ref: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
// Ref: https://www.reddit.com/r/nextjs/comments/18y6cw0/in_server_actions_how_to_cache_external_data_if/
// Ref: https://zenn.dev/frontendflat/articles/nextjs-cache-2024
const getUserParams_cache = (uid: number) =>
  cache(
    async () => {
      return await getFSRSParamsByUid(uid);
    },
    [`actions/user-params/${uid}`],
    {
      tags: [`actions/user-params/${uid}`],
    }
  );

type ICommitUserParams = {
  request_retention: number;
  maximum_interval: number;
  w: number[];
  enable_fuzz: boolean;
  enable_short_term: boolean;
  card_limit: number;
  lapses: number;
  lingq_token: string | null;
};

export async function commitUserParams(data: ICommitUserParams) {
  const uid = await getSessionUserId();
  if (!uid) {
    return { code: 401, msg: 'user not found.', data: null } as IRespose;
  }
  const params = await updateParameters({
    ...data,
    uid,
  });
  revalidateTag(`actions/user-params/${uid}`);
  return {
    code: 200,
    msg: 'success',
    data: null,
  } as IRespose;
}

export async function getUserFSRS() {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const userCacheParams = getUserParams_cache(uid);
  const paramsData = await userCacheParams();
  return fsrs(paramsData.params);
}
