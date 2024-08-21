import { SetStateAction, useCallback, useEffect } from 'react';
import { useScheduler } from './useSchduler';
import { Grade } from 'ts-fsrs';

interface PreviewButtonProps {
  open: boolean;
  setOpen: (update: SetStateAction<boolean>) => void;
  handlerSchduler: (cardId: number, grade: Grade) => Promise<void>;
  handlerRollback: () => Promise<void>;
}

export function useKeyPress({
  open,
  setOpen,
  handlerSchduler,
  handlerRollback,
}: PreviewButtonProps) {
  const handleKeyPress = useCallback(
    async (event: React.KeyboardEvent<HTMLElement>) => {
      // Call updateCalc here
      let cid = 0;
      if (window?.container?.media?.card?.cid) {
        cid = window?.container?.media?.card?.cid;
      }
      if (!open && event.code === 'Space') {
        setOpen(true);
      } else if (open) {
        switch (event.key) {
          case '1':
          case '2':
          case '3':
          case '4':
            cid && (await handlerSchduler(cid, Number(event.key) as Grade));
            break;
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        await handlerRollback();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );
  useEffect(() => {
    // attach the event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyPress(event as unknown as React.KeyboardEvent<HTMLElement>);
    };
    document.addEventListener('keydown', handleKeyDown);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);
}
