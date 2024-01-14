import { FSRSParameters, default_w, generatorParameters } from "ts-fsrs";
import prisma from "./prisma";
import { Parameters } from "@prisma/client";
import { FSRSPutParams } from "@/types";


export type ParametersType = {
    params: FSRSParameters
    uid: number,
    card_limit: number
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


function processArrayParameters(params: Parameters[]): ParametersType {
    if (!params) {
        throw new Error("card not found")
    }
    const fsrsParameters = generatorParameters({
        request_retention: params[0].request_retention,
        maximum_interval: params[0].maximum_interval,
        w: JSON.parse(params[0].w as string),
        enable_fuzz: params[0].enable_fuzz
    })
    return {
        params: fsrsParameters,
        uid: params[0].uid,
        card_limit: params[0].card_limit ?? 50
    }
}


export async function updateParameters(params: FSRSPutParams) {
    if (params.w.length !== default_w.length) {
        params.w = default_w
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
            card_limit: params.card_limit
        }
    })
}