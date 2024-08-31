import { useRef } from 'react';

import EventEmitter from 'events';
import { Toast } from '@/components/ui/use-toast';
import { ToastType } from '@lib/apps/types';

export const toastEmitter = new EventEmitter();

export function useToastListeners(toast: ToastType) {
  const loadedRef = useRef(false);
  if (!loadedRef.current) {
    console.log('load toast listeners');
    loadedRef.current = true;
    toastEmitter.on('toast', (data: Toast) => {
      toast(data);
    });
  }
}
