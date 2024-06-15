'use server';

import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import {
  ParametersType,
  getFSRSParamsByUid,
  updateParameters,
} from '@/lib/fsrs';

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

export async function commitUserParams(formData: FormData) {
  const uid = await getSessionUserId();
  if (!uid) {
    return { code: 401, msg: 'user not found.', data: null } as IRespose;
  }
  // const uid = Number(session.user!!.id)
  const request_retention = Number(formData.get('request_retention'));
  const maximum_interval = Number(
    Number(formData.get('maximum_interval')).toFixed(0)
  );
  const w = JSON.parse(formData.get('w') as string);
  const enable_fuzz = formData.get('enable_fuzz') === 'on' ? true : false;
  const card_limit = Number(Number(formData.get('card_limit')).toFixed(0));
  const lapses = formData.get('lapses')
    ? Math.max(Number(formData.get('lapses')), 3)
    : 8;
  const lingq_token = formData.get('lingq_token')
    ? String(formData.get('lingq_token'))
    : null;
  const data = {
    request_retention,
    maximum_interval,
    w,
    enable_fuzz,
    card_limit,
    uid,
    lapses,
    lingq_token,
  };
  const params = await updateParameters(data);
  return {
    code: 200,
    msg: 'success',
    data: null,
  } as IRespose;
}
