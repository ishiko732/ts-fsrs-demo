import { getAuthSession } from "@/app/(auth)/api/auth/[...nextauth]/session";
import MenuItem from ".";
import SyncSubmitButton from "../submit/SyncSubmit";
import { getFSRSParamsByUid } from "@/lib/fsrs";
import { getLingqLanguageCode, syncLingqs } from "@/vendor/lingq/sync";
import { revalidatePath } from "next/cache";

async function syncLingqAction(formData: FormData) {
    'use server'
    const params = await getParamsRequireLingqToken()
    if (params === null || params.lingq_token == null) {
        throw new Error('No lingq Token');
    }
    const syncUser = {
        token: params.lingq_token,
        uid: params.uid
    }
    const langs = await getLingqLanguageCode(syncUser)
    const syncs = langs.map(async (lang) => syncLingqs(syncUser, lang))
    await Promise.all(syncs)
    revalidatePath("/note")
    return true
};

async function SyncLingq() {
    const params = await getParamsRequireLingqToken()
    return (
        params? <MenuItem tip="Sync Lingq" formAction={syncLingqAction}>
            <SyncSubmitButton />
        </MenuItem>: null
    );
}

export default SyncLingq;

async function getParamsRequireLingqToken(){
    const session = await getAuthSession();
    if (!session?.user) {
        throw new Error('No user');
    }
    const uid = session.user.id
    const params = await getFSRSParamsByUid(Number(uid))
    if (!params.lingq_token) {
        return null;
    }
    return params
}