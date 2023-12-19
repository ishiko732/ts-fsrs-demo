import { FSRSParameters, generatorParameters } from "ts-fsrs";
import prisma from "./prisma";
import { Parameters } from "@prisma/client";


export type ParametersType = {
    params: FSRSParameters
    uid: number
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
        $queryRaw<Parameters[]>`select * from Parameters where uid=(select uid from Note where nid in (select nid from Card where cid=${Number(cid)}))`
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
        uid: params[0].uid
    }
}