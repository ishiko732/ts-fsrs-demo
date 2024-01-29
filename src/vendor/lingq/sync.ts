import prisma from "@/lib/prisma";
import { decryptLingqKey } from "./crypt";
import { getLingqContext, getLingqs } from "./request";
import { createEmptyCardByPrisma } from "../fsrsToPrisma";
import { Prisma } from "@prisma/client";

type SyncUser = {
    uid: number,
    lingq_token: string,
    lingq_counter: string
}
type DecryptSyncUser = {
    uid: number,
    token: string
}

export type SyncWaitUser = DecryptSyncUser & { langs: languageCode[] }

async function syncUser() {
    const users = await prisma.$queryRaw<SyncUser[]>`
        select uid,lingq_token,lingq_counter from Parameters 
        where lingq_token is not null and lingq_counter is not null;`

    const promise = users.map(async (syncUser) => {
        return {
            uid: syncUser.uid,
            token: await decryptLingqKey(syncUser.lingq_token, syncUser.lingq_counter)
        } as DecryptSyncUser
    })
    return Promise.all(promise)
}

async function getLingqLanguageCode(user: DecryptSyncUser) {
    const contexts = await getLingqContext({ token: user.token })
    return contexts.results.map((context) => context.language.code as languageCode)
}

async function syncLingqs(user: DecryptSyncUser, lang: languageCode, next?: number) {
    const data = await getLingqs({ language: lang, token: user.token, page: next, page_size: 50 })
    const promise: Promise<unknown>[] = []

    const hash: { [key: string]: Lingq } = {}
    const collectPks = data.results.map((lingq) => {
        hash[`${lingq.pk}`] = lingq
        return `${lingq.pk}`
    });
    console.log(lang)
    const existSourceIds = await prisma.$queryRaw<{ sourceId: string }[]>
        `select sourceId from Note where uid = ${user.uid} and source = 'lingq' and sourceId in (${Prisma.join(collectPks)});`
    const existPks = existSourceIds.map((note) => note.sourceId)
    const nonExistPks = collectPks.filter((pk) => !existPks.includes(pk));
    console.log(nonExistPks)
    async function sync(hash: { [key: string]: Lingq }, pks: string[]) {
        if (pks.length === 0) {
            return
        }
        const fc = createEmptyCardByPrisma();
        const dates = pks.map((pk) => {
            const lingq = hash[pk]
            const question = lingq.term.replace(/\s+/g, '')
            const note = {
                uid: user.uid,
                question: question,
                answer: lang,
                source: "lingq",
                sourceId: pk,
                extend: JSON.stringify({
                    pk: lingq.pk,
                    term: question,
                    fragment: lingq.fragment,
                    notes: lingq.notes,
                    words: lingq.words,
                    hints: lingq.hints,
                    tags: lingq.tags,
                    transliteration: lingq.transliteration,
                    lang: lang
                }),
                card: {
                    create: fc
                }
            }
            return prisma.note.create({
                data: note,
                include: { card: true },
            });
        })
        await prisma.$transaction(dates)
    }
    if (data.next != null && nonExistPks.length > 0) {
        const page = new URL(data.next).searchParams.get("page")
        promise.push(syncLingqs(user, lang, Number(page)))
    }
    promise.push(sync(hash, nonExistPks))
    await Promise.all(promise)
}



export async function updateNoteByLingq(uid: number, nid: number, lingq: Lingq) {
    const data = await prisma.note.findUnique({
        where: {
            nid: nid,
            uid: uid
        },
        include: { card: true },
    });
    if (!data) { // note not found
        return
    }
    if (uid != data.uid) { // user id not match
        return
    }
    const extend = JSON.parse(data.extend as string)

    const newExtend = JSON.stringify({
        pk: lingq.pk,
        term: lingq.term,
        fragment: lingq.fragment,
        notes: lingq.notes,
        words: lingq.words,
        hints: lingq.hints,
        tags: lingq.tags,
        transliteration: lingq.transliteration,
        lang: extend.lang
    })

    if (newExtend === data.extend) { // extend not change
        return
    }
    return await prisma.note.update({
        where: {
            nid,
            uid
        },
        data: {
            extend: newExtend,
        }
    })

}

export { syncUser, getLingqLanguageCode, syncLingqs }