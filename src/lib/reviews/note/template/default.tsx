import { Note } from '@prisma/client';
import { ITemplate } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState, ReactNode } from 'react';
import { NoteService } from '..';
import LoadingSpinner from '@/components/loadingSpinner';

class DefaultTemplate implements ITemplate {
  constructor() {}

  FrontTemplate = ({
    note,
    children,
  }: {
    note: Note;
    children?: ReactNode;
  }) => {
    return (
      <div className='flex justify-center items-center w-full relative'>
        <div className='inline-block group'>
          <span className='text-2xl'>{note.question}</span>
          {children}
        </div>
      </div>
    );
  };

  BackTemplate = ({ open, note }: { open: boolean; note: Note }) => {
    return open ? (
      <div className='pt-4 mx-auto max-w-5xl px-4'>
        <div>{note?.answer}</div>
      </div>
    ) : null;
  };

  useEditNoteByReview = ({
    note,
    noteSvc,
    open,
    setOpen,
  }: {
    note: Note;
    noteSvc: NoteService;
    open: boolean;
    setOpen: (pre: boolean) => void;
  }) => {
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const handler = async () => {
      setLoading(true);
      await noteSvc.edit(note.nid, {
        question,
        answer,
      });
      setOpen(false);
      setLoading(false);
    };

    useEffect(() => {
      if (open) {
        setQuestion(note.question);
        setAnswer(note.answer);
      }
    }, [note, open]);

    const Component = open ? (
      <div className='grid gap-4 py-4'>
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='question' className='text-right'>
            Question
          </Label>
          <Input
            id='question'
            className='col-span-3'
            placeholder='question'
            onChange={(e) => setQuestion(e.target.value)}
            value={question}
          />
        </div>
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='answer' className='text-right'>
            Answer
          </Label>
          <Input
            id='answer'
            className='col-span-3'
            placeholder='answer'
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
          />
        </div>
      </div>
    ) : (
      <LoadingSpinner />
    );

    const Description = <>Edit the question and answer of your note.</>;

    return { handler, Component, loading, Description };
  };
}

const defaultTemplate: ITemplate = new DefaultTemplate();
export default defaultTemplate;
