import { ReviewSvc } from '@/atom/decks/review';
import { toastEmitter } from '@hooks/useToastListeners';
import { Apps } from '@lib/apps';
import type { IAppService } from '@lib/apps/types';
import type { TEmitCardScheduler } from '@lib/reviews/type';
import { useCallback, useEffect, useRef } from 'react';

export const useExtraService = () => {
  // init event emitter [boxes]
  const { deck: deckSvc, note: noteSvc, card: cardSvc } = ReviewSvc;
  const loadedWindowRef = useRef(false);
  const loadedEmitterRef = useRef(false);

  // 3. Scheduler
  const handlerScheduler = useCallback(
    async (data: TEmitCardScheduler) => {
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
            toastEmitter.emitToast({
              title: `${name} - ${process.status ? 'Success' : 'Error'}`,
              description: process.message,
              variant: process.status ? 'default' : 'destructive',
            });
          }
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!loadedEmitterRef.current) {
      loadedEmitterRef.current = true;
      console.log('[EventEmitter] load extra service');
      cardSvc.on('scheduler', handlerScheduler);
    }

    return () => {
      console.log('[EventEmitter] remove extra service');
      cardSvc.removeListener('scheduler', handlerScheduler);
      loadedEmitterRef.current = false; // 重新设置标志以便于下次正确注册监听器
    };
  }, [cardSvc, handlerScheduler]);

  // 确保 window.extra 只设置一次
  if (typeof window !== 'undefined' && !loadedWindowRef.current) {
    loadedWindowRef.current = true;
    if (typeof window.extra === 'undefined') {
      window.extra = {}; // 直接设置，无需使用Reflect
      Apps.map((app) => {
        window.extra[app.name] = Reflect.construct(app.service, []);
      });
    }
  }
};
