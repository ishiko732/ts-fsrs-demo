'use client';
import { currentNote, currentNoteId, DisplayAnswer } from '@/atom/decks/review';
import LoadingSpinner from '@/components/loadingSpinner';
import { useReviewsInit } from '@hooks/reviews/useInit';
import { TemplateProvider } from '@lib/reviews/note/template';
import { EditNoteBtn } from '@lib/reviews/note/template/extra/EditNote';
import { useAtomValue } from 'jotai';
import { NoteDialog } from './NoteDialog';
function NoteHelper() {
  const { card,  noteSvc } = useReviewsInit();
  const open = useAtomValue(DisplayAnswer);
  const noteId = useAtomValue(currentNoteId);
  const note = useAtomValue(currentNote);
  if (!noteId || !note) {
    return <LoadingSpinner />;
  }

  const source = note?.source ?? '';
  const { FrontTemplate, BackTemplate, useEditNoteByReview } =
    TemplateProvider.getTemplate(source);

  return (
    <>
      <NoteDialog
        note={note}
        noteSvc={noteSvc}
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
