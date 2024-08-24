import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { DisplayAnswer } from '@/atom/decks/review';

export function useOpenKeyPress() {
  const [open, setOpen] = useAtom(DisplayAnswer);
  const handleKeyPress = useCallback(
    async (event: KeyboardEvent) => {
      // Call updateCalc here
      let cid = 0;
      if (window?.container?.media?.card?.cid) {
        cid = window?.container?.media?.card?.cid;
      } else {
        return;
      }
      if (!open && event.code === 'Space') {
        Reflect.set(window.container, 'keypressed', {
          key: event.code,
          open: true,
        });
        setOpen(true);
      }else{
        Reflect.set(window.container, 'keypressed', {
          key: event.code,
          open: false,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );
  useEffect(() => {
    // attach the event listener
    console.log('[Effect]Register OpenKeyPress');
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      console.log('[Effect]remove OpenKeyPress');
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}
