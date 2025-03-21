import { getAuthSession } from '@/app/(auth)/api/auth/[...nextauth]/session';
import { getFSRSParamsByUid } from '@/lib/fsrs';
import { getLingqLanguageCode, syncLingqs } from '@/vendor/lingq/sync';

import SyncSubmitButton from '../submit/SyncSubmit';
import MenuItem from '.';

async function syncLingqAction() {
  'use server';
  const params = await getParamsRequireLingqToken();
  if (params === null || params.lingq_token == null) {
    throw new Error('No lingq Token');
  }
  const syncUser = {
    token: params.lingq_token,
    uid: params.uid,
  };
  const langs = await getLingqLanguageCode(syncUser);
  return langs;
}

async function SyncLingq() {
  const params = await getParamsRequireLingqToken();
  const  tip='Sync Lingq'
  return params ? (
    <MenuItem tip={tip}>
      <SyncSubmitButton action={syncLingqAction} tip={tip} />
    </MenuItem>
  ) : null;
}

export default SyncLingq;

async function getParamsRequireLingqToken() {
  const session = await getAuthSession();
  if (!session?.user) {
    throw new Error('No user');
  }
  const uid = session.user.id;
  const params = await getFSRSParamsByUid(Number(uid));
  if (!params.lingq_token) {
    return null;
  }
  return params;
}
