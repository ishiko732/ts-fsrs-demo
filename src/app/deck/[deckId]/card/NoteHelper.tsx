'use client';
import { currentNote, DisplayAnswer, ReviewSvc } from '@/atom/decks/review';
import LoadingSpinner from '@/components/loadingSpinner';
import { useReviewsInit } from '@hooks/reviews/useInit';
import { TemplateProvider } from '@lib/reviews/note/template';
import { EditNoteBtn } from '@lib/reviews/note/template/extra/EditNote';
import { useAtomValue } from 'jotai';
import { NoteDialog } from './NoteDialog';
function NoteHelper() {
  useReviewsInit();
  const note = useAtomValue(currentNote);
  const open = useAtomValue(DisplayAnswer);

  const source = note?.source ?? '';
  const { FrontTemplate, BackTemplate, useEditNoteByReview } =
    TemplateProvider(source);

  if (!note) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <NoteDialog
        note={note}
        noteSvc={ReviewSvc.note}
        useEditNoteByReview={useEditNoteByReview}
      />
      <FrontTemplate note={note} open={open}>
        <EditNoteBtn />
      </FrontTemplate>
      <BackTemplate open={open} note={note} />
    </>
  );
}

export default NoteHelper;
