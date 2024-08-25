import { LingqService } from '@lib/apps/lingq';
import { useRef } from 'react';

export const useExtraService = () => {
  const loadedRef = useRef(false);

  if (typeof window !== 'undefined' && !loadedRef.current) {
    loadedRef.current = true;
    // load extra service
    if (typeof window.extra === 'undefined') {
      Reflect.set(window, 'extra', {});
    }
    Reflect.set(window.extra, 'lingq', new LingqService());
  }
};
