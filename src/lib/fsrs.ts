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
}

export async function getFSRSParamsByUid(uid: number): Promise<ParametersType> {
    const params: Parameters[] = await prisma.
        $queryRaw<Parameters[]>`select * from Parameters where uid=${Number(uid)}`
    if (!params) {
        throw new Error("note not found")
    }
    return processArrayParameters(params)
}

export async function getFSRSParamsByNid(nid: number): Promise<ParametersType> {
    const params: Parameters[] = await prisma.
        $queryRaw<Parameters[]>`select * from Parameters where uid=(select uid from Note where nid=${Number(nid)})`
    if (!params) {
        throw new Error("note not found")
    }
    return processArrayParameters(params)
}

export async function getFSRSParamsByCid(cid: number): Promise<ParametersType> {
    const params: Parameters[] = await prisma.
        $queryRaw<Parameters[]>`
        select * from Parameters 
        where uid=(select uid from Note 
                   where nid in (select nid from Card where cid=${Number(cid)}))`
    if (!params) {
        throw new Error("card not found")
    }
    return processArrayParameters(params)
}


async function processArrayParameters(params: Parameters[]): Promise<ParametersType> {
    if (!params) {
        throw new Error("card not found")
    }
    const fsrsParameters = generatorParameters({
        request_retention: params[0].request_retention,
        maximum_interval: params[0].maximum_interval,
        w: JSON.parse(params[0].w as string),
        enable_fuzz: params[0].enable_fuzz
    })
    let lingq_token = null
    if (params[0].lingq_token && params[0].lingq_counter && params[0].lingq_token.length > 0) {
        lingq_token = await decryptLingqKey(params[0].lingq_token, params[0].lingq_counter)
    }

    return {
        params: fsrsParameters,
        uid: params[0].uid,
        card_limit: params[0].card_limit ?? 50,
        lingq_token: lingq_token
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
            lingq_token: token,
            lingq_counter: counter
        }
    })
}

export async function getFSRS<T extends boolean = boolean>
    (cid:number,skip: T=false as T)
    : Promise<T extends true ? null : FSRS> {
    const {params,uid} = await getFSRSParamsByCid(cid)
    const permission = await isAdminOrSelf(uid)
    if(!permission){
        throw new Error("permission denied")
    }
    if(skip){
        return null as T extends true ? null : FSRS;
    }
    const f = fsrs(params) as FSRS
    return f as T extends true ? null : FSRS;
}