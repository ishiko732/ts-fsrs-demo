import { Note } from '@prisma/client';
import { ReactNode } from 'react';
import { NoteService } from '..';

export interface ITemplate {
  FrontTemplate: (data: {
    open: boolean;
    note: Note;
    children?: ReactNode;
  }) => ReactNode;
  BackTemplate: (data: {
    open: boolean;
    note: Note;
    children?: ReactNode;
  }) => ReactNode;
  useEditNoteByReview: (data: {
    note: Note;
    noteSvc: NoteService;
    open: boolean;
    setOpen: (pre: boolean) => void;
  }) => {
    handler: () => Promise<void>;
    loading: boolean;
    Component: ReactNode;
    Description: ReactNode;
  };
}
