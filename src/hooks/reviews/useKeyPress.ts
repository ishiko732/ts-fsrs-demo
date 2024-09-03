import { useCallback, useEffect } from 'react';
import { Grade } from 'ts-fsrs';

interface PreviewButtonProps {
  handlerScheduler: (cardId: number, grade: Grade) => Promise<void>;
  handlerRollback: () => Promise<void>;
}

export function useSchdulerKeyPress({
  handlerScheduler,
  handlerRollback,
}: PreviewButtonProps) {
  const handleKeyPress = useCallback(
    async (event: KeyboardEvent) => {
      // Call updateCalc here
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        await handlerRollback();
      }
      if (window.container?.keypressed?.open) {
        let cid = 0;
        if (window?.container?.media?.card?.cid) {
          cid = window?.container?.media?.card?.cid;
        } else {
          return;
        }
        switch (event.key) {
          case '1':
          case '2':
          case '3':
          case '4':
            cid && (await handlerScheduler(cid, Number(event.key) as Grade));
            Reflect.set(window.container!, 'keypressed', {
              key: event.code,
              open: false,
              cid: cid,
            });
            break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(() => {
    // attach the event listener
    console.log('[Effect]Register SchedulerKeyPress');
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      console.log('[Effect]remove SchedulerKeyPress');
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}
