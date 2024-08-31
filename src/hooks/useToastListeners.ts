import { useCallback, useEffect, useRef } from 'react';

import EventEmitter from 'events';
import { Toast } from '@/components/ui/use-toast';
import { ToastType } from '@lib/apps/types';

export const toastEmitter = new EventEmitter();

export function useToastListeners(toast: ToastType) {
  const loadedRef = useRef(false);
  const handler = useCallback(() => {
    (data: Toast) => {
      toast(data);
    };
  }, [toast]);
  useEffect(() => {
    if (!loadedRef.current) {
      console.log('[EventEmitter] load toast listeners');
      loadedRef.current = true;
      toastEmitter.on('toast', handler);
    }
    return () => {
      console.log('[EventEmitter] remove toast listeners');
      toastEmitter.removeListener('toast', handler);
      loadedRef.current = false;
    };
  });
}
