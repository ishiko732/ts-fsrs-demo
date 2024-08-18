'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SetStateAction, useAtom, useAtomValue } from 'jotai';
import {
  currentCardId,
  CurrentPreviewAtom,
  DisplayAnswer,
  ReviewSvc,
} from '@/atom/decks/review';
import { useKeyPress } from '@hooks/reviews/useKeyPress';
import { Grade, Grades, Rating, RecordLog, show_diff_message } from 'ts-fsrs';
import { cn } from '@lib/utils';
import LoadingSpinner from '@/components/loadingSpinner';

interface PreviewButtonProps {
  open: boolean;
  setOpen: (update: SetStateAction<boolean>) => void;
}

const ShowAnswer = ({ setOpen }: PreviewButtonProps) => {
  return (
    <Button
      className='mt-4 tooltip tooltip-bottom w-full'
      onClick={() => {
        setOpen(true);
      }}
      variant={'outline'}
      title='Press Space to show answer'
    >
      Show Answer
    </Button>
  );
};

const Preview = ({
  recordLog,
  cardId,
}: {
  recordLog: RecordLog | null;
  cardId: number;
}) => {
  const cardSvc = useAtomValue(ReviewSvc.card);
  const color = ['bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500'];
  const hoverColor = [
    'hover:bg-red-600',
    'hover:bg-orange-600',
    'hover:bg-blue-600',
    'hover:bg-green-600',
  ];

  const handlerSchduler = useCallback(
    async (grade: Grade) => {
      const now = new Date();
      cardSvc.schduler(cardId, now, grade);
    },
    [cardId, cardSvc]
  );
  if (!recordLog) {
    return <LoadingSpinner />;
  }

  return (
    <div className='flex justify-center pt-6'>
      {Grades.map((grade: Grade) =>
        show_diff_message(
          recordLog[grade].card.due,
          recordLog[grade].card.last_review as Date,
          true
        )
      ).map((time: string, index: number) => (
        <Button
          key={Rating[(index + 1) as Grade]}
          className={cn(
            'btn mx-2 btn-sm md:btn-md tooltip tooltip-bottom bg-orange-500',
            color[index],
            hoverColor[index]
          )}
          onClick={async (e) => handlerSchduler(index + 1)}
          title={time}
        >
          <span>{Rating[(index + 1) as Grade]}</span>
          <span className='hidden sm:inline'>
            <kbd
              className={`ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100`}
            >
              <span className='text-xs'>{index + 1}</span>
            </kbd>
          </span>
        </Button>
      ))}
    </div>
  );
};

function PreviewButton() {
  const [open, setOpen] = useAtom(DisplayAnswer);
  const cardId = useAtomValue(currentCardId);
  const recordLog = useAtomValue(CurrentPreviewAtom);
  useKeyPress({ open, setOpen });
  return open ? (
    <Preview recordLog={recordLog ?? null} cardId={cardId} />
  ) : (
    <ShowAnswer open={open} setOpen={setOpen} />
  );
}

export default PreviewButton;
