'use client';
import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ITemplate } from '@lib/reviews/note/template/types';
import { Note } from '@prisma/client';
import { NoteService } from '@lib/reviews/note';
import LoadingSpinner from '@/components/loadingSpinner';
import { DrawerClose } from '@/components/ui/drawer';
import { useAtom } from 'jotai';
import { DisplayNoteDialog } from '@/atom/decks/review';

type Props = {
  note: Note;
  noteSvc: NoteService;
  useEditNoteByReview: ITemplate['useEditNoteByReview'];
};

export function NoteDialog({ note, noteSvc, useEditNoteByReview }: Props) {
  const [open, setOpen] = useAtom(DisplayNoteDialog);
  const { loading, handler, Component, Description } = useEditNoteByReview({
    note,
    noteSvc,
    open,
    setOpen,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>{Description}</DialogDescription>
        </DialogHeader>
        <Suspense>{Component}</Suspense>
        <DialogFooter>
          <DrawerClose onClick={() => setOpen(false)} asChild>
            <Button variant='outline'>Cancel</Button>
          </DrawerClose>
          <Button onClick={handler} disabled={loading}>
            {loading && <LoadingSpinner />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
