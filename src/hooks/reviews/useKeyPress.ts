import { nextTick } from 'process';
import { useCallback, useEffect } from 'react';
import { Grade } from 'ts-fsrs';
import { number } from 'zod';

interface PreviewButtonProps {
  handlerSchduler: (cardId: number, grade: Grade) => Promise<void>;
  handlerRollback: () => Promise<void>;
}

export function useSchdulerKeyPress({
  handlerSchduler,
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
            cid && (await handlerSchduler(cid, Number(event.key) as Grade));
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
    console.log('[Effect]Register SchdulerKeyPress');
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      console.log('[Effect]remove SchdulerKeyPress');
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}
