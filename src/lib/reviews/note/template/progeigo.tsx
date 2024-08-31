import { Note } from '@prisma/client';
import { ITemplate } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState, ReactNode } from 'react';
import { NoteService } from '..';
import LoadingSpinner from '@/components/loadingSpinner';
import { ProgeigoNodeData } from '@/types';
import Audio from '@/lib/reviews/note/template/extra/Audio';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useTheme } from 'next-themes';

class ProgeigoTemplate implements ITemplate {
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
    if (!note) {
      return null;
    }
    const extend = note.extend as unknown as ProgeigoNodeData;
    const { 分類, 品詞, 例文, 例文訳, 解説, 発音 } = extend;
    return open ? (
      <>
        <div className='flex justify-center items-center text-sm opacity-60'>
          {分類 && <span>{`${分類}`}</span>}
          {分類 && 品詞 && <span>|</span>}
          {品詞 && <span>{`${品詞}`}</span>}
        </div>
        <div className='py-4 mx-auto max-w-5xl px-4'>
          <div>意味:{note?.answer}</div>
          {例文 && <div>例文:{例文}</div>}
          {例文訳 && <div>例文訳:{例文訳}</div>}
          {解説 && <div>解説:{解説}</div>}
          {発音 && <Audio url={発音} />}
        </div>
      </>
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
    const [extend, setExtend] = useState<string>();
    const { theme, systemTheme } = useTheme();
    const themeMode =
      theme === 'dark' ? 'dark' : theme === 'system' ? systemTheme : 'light';

    const handler = async () => {
      setLoading(true);
      await noteSvc.edit(note.nid, {
        question,
        answer,
        extend: extend ? JSON.parse(extend) : undefined,
      });
      setOpen(false);
      setLoading(false);
    };

    useEffect(() => {
      if (open) {
        setQuestion(note.question);
        setAnswer(note.answer);
        setExtend(JSON.stringify(note.extend, null, 2));
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
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='extend' className='text-right'>
            Extend
          </Label>
          <CodeEditor
            value={extend}
            className='col-span-3'
            language='json'
            placeholder='Please enter the extend data in JSON format'
            onChange={(evn) => setExtend(evn.target.value)}
            padding={15}
            style={{
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
            data-color-mode={themeMode}
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

const progeigoTemplate: ITemplate = new ProgeigoTemplate();
export default progeigoTemplate;
