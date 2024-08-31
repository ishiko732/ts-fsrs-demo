import { ReviewSvc } from '@/atom/decks/review';
import { toastEmitter } from '@hooks/useToastListeners';
// import { useToast } from '@/components/ui/use-toast';
import { Apps } from '@lib/apps';
import type { IAppService } from '@lib/apps/types';
import type { TEmitCardScheduler } from '@lib/reviews/type';
import { useAtomValue } from 'jotai';
import { useRef } from 'react';

export const useExtraService = () => {
  // init event emitter [boxes]
  const deckSvc = useAtomValue(ReviewSvc.deck);
  const noteSvc = useAtomValue(ReviewSvc.note);
  const cardSvc = useAtomValue(ReviewSvc.card);
  const loadedWindowRef = useRef(false);
  const loadedEmitterRef = useRef(false);
  // const { toast } = useToast();

  if (typeof window !== 'undefined' && !loadedWindowRef.current) {
    loadedWindowRef.current = true;
    // load extra service
    if (typeof window.extra === 'undefined') {
      Reflect.set(window, 'extra', {});
    }
    Apps.map((app) => {
      Reflect.set(window.extra, app.name, Reflect.construct(app.service, []));
    });
  }

  // 3. Scheduler
  if (!loadedEmitterRef.current) {
    cardSvc.on('scheduler', async (data: TEmitCardScheduler) => {
      const deck = await deckSvc.getDeck();
      const note = await noteSvc.getNote(data.nid);
      for (const [name, _app] of Object.entries(window.extra)) {
        const app = _app as IAppService;
        if (
          app &&
          typeof app.allowCall === 'function' &&
          typeof app.sync === 'function'
        ) {
          if (app.allowCall(note?.source ?? '')) {
            const extend = deck.extends as Record<string, object>;
            const process = await app
              .sync(extend[name], note, data)
              .then((res) => {
                return {
                  status: true,
                  message: 'Sync review status successfully',
                };
              })
              .catch((err) => {
                console.error(err);
                return {
                  status: false,
                  message: (err as Error).message,
                };
              });
            toastEmitter.emit('toast', {
              title: `${name} - ${process.status ? 'Success' : 'Error'}`,
              description: process.message,
              variant: process.status ? 'default' : 'destructive',
            });
          }
        }
      }
    });
  }
  loadedEmitterRef.current = true;
};
