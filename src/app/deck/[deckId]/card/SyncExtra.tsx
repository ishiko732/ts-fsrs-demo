'use client';

import LoadingSpinner from '@/components/loadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useRef, useState } from 'react';
import type { DeckService } from '@lib/reviews/deck';
import type { IAppService } from '@lib/apps/types';

export function SyncExtra() {
  const { toast } = useToast();
  const loadedRef = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const not_exist_svc = svcUndefined();
    if (not_exist_svc || loadedRef.current) {
      return;
    }
    new Promise(async () => {
      loadedRef.current = true;
      const deckSvc: DeckService = window.container.svc.deckSvc;
      const extra: Record<string, IAppService> = window.extra;
      const deck = await deckSvc.getDeck();
      const extend = deck.extends as Record<string, object>;
      for (const [service, params] of Object.entries(extend)) {
        const svc = extra[service];
        if (svc) {
          toast({
            title: service,
            description: `Service ${service} found , run pull`,
          });
          await svc.pull(deck.did, params, toast);
          setTimeout(() => {
            toast({
              title: service,
              description: `Service ${service} found , run pull done`,
            });
          }, 0);
        } else {
          toast({
            title: 'Extra Service Syncing',
            description: `Service ${service} not found`,
          });
        }
      }
      setDone(true);
    });
  }, []);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <>
      {!done ? (
        <div className='flex  justify-center items-center pb-4'>
          <LoadingSpinner />
          <span>Wait Extra Service Syncing ...</span>
        </div>
      ) : (
        <div className='flex  justify-center items-center pb-4'>
          <span>Extra Service Syncing Done</span>
        </div>
      )}
    </>
  );
}

const svcUndefined = () =>
  typeof window === 'undefined' ||
  typeof window?.container?.svc?.deckSvc === 'undefined' ||
  typeof window?.extra === 'undefined';
