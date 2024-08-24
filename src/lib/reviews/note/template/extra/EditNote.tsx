import { DisplayNoteDialog } from '@/atom/decks/review';
import { Button } from '@/components/ui/button';
import { cn } from '@lib/utils';
import { useSetAtom } from 'jotai';
import { Pencil } from 'lucide-react';
import React from 'react';

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export function EditNoteBtn({ children, className }: Props) {
  const setOpen = useSetAtom(DisplayNoteDialog);
  const handlerClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setOpen(true);
  };
  return (
    <Button
      variant='outline'
      size='icon'
      className={cn(
        'absolute top-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8',
        className
      )}
      aria-label='edit note'
      title='Edit Note'
      onClick={handlerClick}
    >
      <Pencil />
      {children}
    </Button>
  );
}
