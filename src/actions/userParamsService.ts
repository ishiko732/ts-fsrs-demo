'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import {
  ParametersType,
  getFSRSParamsByUid,
  updateParameters,
} from '@/lib/fsrs';
import { revalidatePath, revalidateTag } from 'next/cache';

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
  revalidateTag(`user-params-${uid}`);
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
  revalidatePath(`user-params-${uid}`);
  return {
    code: 200,
    msg: 'success',
    data: null,
  } as IRespose;
}
