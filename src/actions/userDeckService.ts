'use server';
import 'server-only';
import prisma from '@/lib/prisma';
import { unstable_cache as cache, revalidateTag } from 'next/cache';
import { Deck } from '@prisma/client';
import { generatorParameters } from 'ts-fsrs';
import { getSessionUserId } from '@auth/session';

export async function getParamsByUserId(deckId: number = 0) {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('user not found.');
  }
  const get = getParamsByUserId_cache(uid, deckId);
  return await get();
}

const defaultParams = (uid: number) => {
  return {
    did: 0,
    uid: uid,
    name: 'Default',
    fsrs: JSON.stringify(generatorParameters()),
    card_limit: 50,
    lapses: 8,
    extends: JSON.stringify({}),
  } satisfies Omit<Deck, 'deleted'>;
};

const getParamsByUserId_cache = (uid: number, deckId?: number) => {
  return cache(
    async () => {
      if (deckId === 0) {
        return { 0: defaultParams(uid) };
      }
      const decks: Deck[] = await prisma.deck.findMany({
        where: { uid, did: deckId },
      });
      const resp: Record<string, Omit<Deck, 'deleted'>> = {};
      for (const data of decks) {
        const { deleted, ...rest } = data;
        resp[data.did] = rest;
      }
      resp[0] = defaultParams(uid);
      return resp;
    },
    [`actions/deck_params/${uid}/deck/${deckId}`],
    {
      tags: [`actions/deck_params/${uid}`],
    }
  ) satisfies () => Promise<Record<string, Omit<Deck, 'deleted'>>>;
};
