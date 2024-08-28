import { Apps } from '@lib/apps';
import { useRef } from 'react';

export const useExtraService = () => {
  const loadedRef = useRef(false);

  if (typeof window !== 'undefined' && !loadedRef.current) {
    loadedRef.current = true;
    // load extra service
    if (typeof window.extra === 'undefined') {
      Reflect.set(window, 'extra', {});
    }
    Apps.map((app) => {
      Reflect.set(window.extra, app.name, new app.service());
    });
  }
};
