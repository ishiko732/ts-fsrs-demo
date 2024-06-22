'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import {
  ParametersType,
  getFSRSParamsByUid,
  updateParameters,
} from '@/lib/fsrs';
import { revalidatePath, unstable_cache as cache } from 'next/cache';
type IRespose = {
  code: number;
  msg: string;
  data: null | ParametersType;
};

async function _getUserParams() {
  const uid = await getSessionUserId();
  if (!uid) {
    return { code: 401, msg: 'user not found.', data: null } as IRespose;
  }
  try {
    return {
      code: 200,
      msg: 'success',
      data: await getFSRSParamsByUid(uid),
    } as IRespose;
  } catch (e: any) {
    return { code: 500, msg: (e as Error).message, data: null } as IRespose;
  }
}

// Ref: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
// Ref: https://www.reddit.com/r/nextjs/comments/18y6cw0/in_server_actions_how_to_cache_external_data_if/
export const getUserParams = cache(_getUserParams, [
  'actions/user-params-' + getSessionUserId(),
]);

type ICommitUserParams = {
  request_retention: number;
  maximum_interval: number;
  w: number[];
  enable_fuzz: boolean;
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
  revalidatePath(`actions/user-params-${uid}`);
  return {
    code: 200,
    msg: 'success',
    data: null,
  } as IRespose;
}
