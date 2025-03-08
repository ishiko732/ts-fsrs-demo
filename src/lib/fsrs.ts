import { Parameters } from '@prisma/client';
import { getSessionUserId } from '@server/services/auth/session'
import {
  default_w,
  FSRS,
  fsrs,
  FSRSParameters,
  generatorParameters,
} from 'ts-fsrs';

import { FSRSPutParams } from '@/types';
import { decryptLingqKey, encryptLingqKey } from '@/vendor/lingq/crypt';

import prisma from './prisma';

export type ParametersType = {
  params: FSRSParameters;
  uid: number;
  card_limit: number;
  lingq_token: string | null;
  lapses: number;
};

export async function getFSRSParamsByUid(uid: number): Promise<ParametersType> {
  const params: Parameters | null = await prisma.parameters.findUnique({
    where: {
      uid: uid,
    },
  });
  if (!params) {
    throw new Error(`uid(uid=${uid}) not found`);
  }
  return processArrayParameters(params);
}

async function processArrayParameters(
  params: Parameters
): Promise<ParametersType> {
  if (!params) {
    throw new Error('params not found');
  }
  const fsrsParameters = generatorParameters({
    request_retention: params.request_retention,
    maximum_interval: params.maximum_interval,
    w: JSON.parse(params.w as string),
    enable_fuzz: params.enable_fuzz,
    enable_short_term: params.enable_short_term,
  });
  let lingq_token = null;
  if (
    params.lingq_token &&
    params.lingq_counter &&
    params.lingq_token.length > 0
  ) {
    lingq_token = await decryptLingqKey(
      params.lingq_token,
      params.lingq_counter
    );
  }

  return {
    params: fsrsParameters,
    uid: params.uid,
    card_limit: params.card_limit ?? 50,
    lingq_token: lingq_token,
    lapses: Math.max(3, params.lapses),
  };
}

export async function updateParameters(params: FSRSPutParams) {
  if (params.w.length !== default_w.length) {
    params.w = default_w;
  }

  let counter = null,
    token = null;
  if (params.lingq_token && params.lingq_token.length > 0) {
    const { lingq_token, lingq_counter } = await encryptLingqKey(
      params.lingq_token
    );
    token = lingq_token;
    counter = lingq_counter;
  }
  return prisma.parameters.update({
    where: {
      uid: params.uid,
    },
    data: {
      request_retention: params.request_retention,
      maximum_interval: params.maximum_interval,
      w: JSON.stringify(params.w),
      enable_fuzz: params.enable_fuzz,
      enable_short_term: params.enable_short_term,
      card_limit: params.card_limit,
      lapses: params.lapses,
      lingq_token: token,
      lingq_counter: counter,
    },
  });
}

/**
 * verify if the user has the permission to access the FSRS
 * @throws permission denied
 */
export async function getFSRSBySessionUser(verifyUid: number) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('uid not found');
  }
  if (verifyUid !== uid) {
    throw new Error('permission denied');
  }
  const userParams = await getFSRSParamsByUid(uid);
  const f = fsrs(userParams.params) as FSRS;
  return {
    f,
    userParams,
  } as { f: FSRS; userParams: ParametersType };
}
