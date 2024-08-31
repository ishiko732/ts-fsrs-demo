import { useEffect } from 'react';

import EventEmitter from 'events';
import { Toast } from '@/components/ui/use-toast';
import { ToastType } from '@lib/apps/types';

class ToastEmitter extends EventEmitter {
  constructor() {
    super();
  }
  emitToast(data: Toast) {
    return this.emit('toast', data);
  }
}

export const toastEmitter = new ToastEmitter();

export function useToastListeners(toast: ToastType) {
  useEffect(() => {
    const handler = (data: Toast) => {
      toast(data);
    };
    if (typeof window !== 'undefined') {
      Reflect.set(window, 'toast', toastEmitter);
    }
    console.log('[EventEmitter] load toast listeners');
    toastEmitter.on('toast', handler);
    return () => {
      console.log('[EventEmitter] remove toast listeners');
      toastEmitter.removeListener('toast', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
