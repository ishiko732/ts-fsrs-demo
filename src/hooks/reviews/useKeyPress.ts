import { SetStateAction, useCallback, useEffect } from 'react';

interface PreviewButtonProps {
  open: boolean;
  setOpen: (update: SetStateAction<boolean>) => void;
}

export function useKeyPress({ open, setOpen }: PreviewButtonProps) {
  const handleKeyPress = useCallback(
    async (event: React.KeyboardEvent<HTMLElement>) => {
      // Call updateCalc here
      if (!open && event.code === 'Space') {
        setOpen(true);
      } else if (open) {
        switch (event.key) {
          case '1':
          case '2':
          case '3':
          case '4':
            // await handleSchdule(Number(event.key) as Grade);
            break;
        }
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        // await handleRollBack();
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
