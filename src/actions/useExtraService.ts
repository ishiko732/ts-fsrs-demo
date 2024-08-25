'use server';

import { decryptKey, encryptKey } from '@lib/crypt';

export async function getKeyAction(key: string, counter: string) {
  return decryptKey(key, counter);
}

export async function setKeyAction(key: string) {
  return encryptKey(key);
}
