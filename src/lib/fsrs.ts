import { FSRS, FSRSParameters, default_w, fsrs, generatorParameters } from "ts-fsrs";
import prisma from "./prisma";
import { Parameters } from "@prisma/client";
import { FSRSPutParams } from "@/types";
import { decryptLingqKey, encryptLingqKey } from "@/vendor/lingq/crypt";
import { isAdminOrSelf } from "@/app/(auth)/api/auth/[...nextauth]/session";

export type ParametersType = {
    params: FSRSParameters
    uid: number,
    card_limit: number,
    lingq_token: string | null
    lapses: number;
}

export async function getFSRSParamsByUid(uid: number): Promise<ParametersType> {
    const params: Parameters|null = await prisma.parameters.findUnique({
            where: {
                uid: uid
            }
        })
    if (!params) {
        throw new Error(`uid(uid=${uid}) not found`)
    }
    return processArrayParameters(params)
}

export async function getFSRSParamsByNid(nid: number): Promise<ParametersType> {
    const note_only_uid = await prisma.note.findUnique({
        where:{
            nid
        },
        select:{
            uid:true
        }
    })
    if (!note_only_uid) {
      throw new Error(`note(nid=${nid}) not found`);
    }
    return getFSRSParamsByUid(note_only_uid.uid);
}

export async function getFSRSParamsByCid(cid: number): Promise<ParametersType> {
        const note_only_uid = await prisma.note.findFirst({
          where: {
            card:{
                cid:cid,
            }
          },
          select: {
            uid: true,
          },
        });
    if (!note_only_uid) {
      throw new Error(`card(cid=${cid}) not found`);
    }
    return getFSRSParamsByUid(note_only_uid.uid);
}


async function processArrayParameters(params: Parameters): Promise<ParametersType> {
    if (!params) {
        throw new Error("params not found")
    }
    const fsrsParameters = generatorParameters({
        request_retention: params.request_retention,
        maximum_interval: params.maximum_interval,
        w: JSON.parse(params.w as string),
        enable_fuzz: params.enable_fuzz
    })
    let lingq_token = null
    if (params.lingq_token && params.lingq_counter && params.lingq_token.length > 0) {
        lingq_token = await decryptLingqKey(params.lingq_token, params.lingq_counter)
    }

    return {
        params: fsrsParameters,
        uid: params.uid,
        card_limit: params.card_limit ?? 50,
        lingq_token: lingq_token,
        lapses: Math.max(3,params.lapses)
    }
}


export async function updateParameters(params: FSRSPutParams) {
    if (params.w.length !== default_w.length) {
        params.w = default_w
    }

    let counter = null, token = null
    if (params.lingq_token && params.lingq_token.length > 0) {
        const { lingq_token, lingq_counter } = await encryptLingqKey(params.lingq_token)
        token = lingq_token
        counter = lingq_counter
    }
    return prisma.parameters.update({
        where: {
            uid: params.uid
        },
        data: {
            request_retention: params.request_retention,
            maximum_interval: params.maximum_interval,
            w: JSON.stringify(params.w),
            enable_fuzz: params.enable_fuzz,
            card_limit: params.card_limit,
            lapses:params.lapses,
            lingq_token: token,
            lingq_counter: counter
        }
    })
}


/**
 * verify if the user has the permission to access the FSRS
 * if the user is the admin or the owner of the FSRS, return the FSRS and the user parameters
 * @param cid card id
 * @throws permission denied
 */
export async function getFSRS(cid: number) {
  const userParams = await getFSRSParamsByCid(cid);
  const permission = await isAdminOrSelf(userParams.uid);
  if (!permission) {
    throw new Error("permission denied");
  }
  const f = fsrs(userParams.params) as FSRS;
  return {
    f,
    userParams,
  } as { f: FSRS; userParams: ParametersType };
}