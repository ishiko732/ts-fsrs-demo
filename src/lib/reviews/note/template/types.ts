import { Note } from '@prisma/client';
import { ReactNode } from 'react';

export interface ITemplate {
  FrontTemplate: (data: { note: Note }) => ReactNode;
  BackTemplate: (data: { open: boolean; note: Note }) => ReactNode;
}
