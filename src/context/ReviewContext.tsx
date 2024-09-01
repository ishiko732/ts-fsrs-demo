'use client';
import { createStore, Provider } from 'jotai';
import { useMemo } from 'react';

export default function ReviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const ReviewStore: ReturnType<typeof createStore> = useMemo(() => {
    return createStore();
  }, []);

  return <Provider store={ReviewStore}>{children}</Provider>;
}
