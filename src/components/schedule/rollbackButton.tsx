'use client';

import { useCardContext } from '@/context/CardContext';

import { Button } from '../ui/button';

export default function RollbackButton() {
  const { rollbackAble, handleRollBack } = useCardContext();

  return rollbackAble ? (
    <Button
      className='sm:hidden w-full md:w-[80%] mt-4'
      variant={'outline'}
      onClick={async () => {
        await handleRollBack();
      }}
      title='Press Ctrl+Z(⌘+Z) to rollback'
    >
      Rollback
    </Button>
  ) : null;
}
