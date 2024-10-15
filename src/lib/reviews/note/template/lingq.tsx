import { Note } from '@prisma/client';
import { ITemplate } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState, ReactNode, useRef } from 'react';
import { NoteService } from '..';
import LoadingSpinner from '@/components/loadingSpinner';
import { ProgeigoNodeData } from '@/types';
import Audio from '@/lib/reviews/note/template/extra/Audio';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useTheme } from 'next-themes';
import { HighlightedWord, MergeAnswer } from '@lib/apps/lingq/utils';
import { Badge } from '@/components/ui/badge';

class LingqTemplate implements ITemplate {
  constructor() {}

  FrontTemplate = ({
    open,
    note,
    children,
  }: {
    open: boolean;
    note: Note;
    children?: ReactNode;
  }) => {
    const extend = note.extend as Partial<Lingq> & {
      lang: string;
    };
    const lang = extend.lang;
    const fragment = extend.fragment!!;
    const transliteration = extend.transliteration;
    const tags = extend.tags;
    const words = extend.words;
    const [audio, setAudio] = useState<string>();
    const audioRef = useRef<HTMLAudioElement>(null);
    // useEffect(() => {
    //   setAudio(undefined);
    //   if ((note && lang === "ja") || lang === "en") {
    //     (async () => {
    //       const url =
    //         "/api/lingq/v2/tts?" +
    //         new URLSearchParams({
    //           language: lang,
    //           text: note.question,
    //         }).toString();
    //       const token = await getLingqToken();
    //       console.log(token);
    //       if (!token) {
    //         return;
    //       }
    //       const tts: LingqTTS = await fetch(url, {
    //         method: "GET",
    //         headers: {
    //           Authorization: token,
    //         },
    //       }).then((res) => res.json());
    //       if (tts) {
    //         setAudio(tts.audio);
    //       }
    //     })();
    //   }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [note]);
    return (
      <>
        <div className='w-full flex justify-center items-center relative'>
          <div className='inline-block group'>
            <span className='text-2xl'>{note.question}</span>
            {children}
            <Badge>{lang}</Badge>
          </div>
        </div>
        <div className='flex justify-center flex-col items-center opacity-60 pt-4 gap-2'>
          {open && transliteration && (
            <div> {<MergeAnswer answer={note.answer} />}</div>
          )}
          <div className='text-sm'>
            {tags?.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          {open && words ? (
            <div className='text-sm pt-2'>
              {words?.map((word) => (
                <span key={word} className='badge badge-ghost'>
                  {word}
                </span>
              ))}
            </div>
          ) : null}
          <div>
            <HighlightedWord text={fragment} word={note.question} />
          </div>
          {/* {audio && (
              <Audio
                url={audio}
                ref={audioRef}
                onCanPlay={(e) => {
                  audioRef.current?.play();
                }}
              />
            )} */}
        </div>
      </>
    );
  };

  BackTemplate = ({ open, note }: { open: boolean; note: Note }) => {
    if (!note) {
      return null;
    }
    const extend = note.extend as Partial<Lingq>;
    const hints = extend.hints;
    return open ? (
      <div className='pt-4 mx-auto max-w-5xl px-4'>
        <ul>
          {hints?.map((hint) => (
            <li key={hint.id}>
              <span>{hint.locale}</span>
              {hint.text}
            </li>
          ))}
        </ul>
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

const lingqTemplate: ITemplate = new LingqTemplate();
export default lingqTemplate;
