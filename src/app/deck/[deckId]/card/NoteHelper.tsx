'use client';
import { DisplayAnswer } from '@/atom/decks/review';
import LoadingSpinner from '@/components/loadingSpinner';
import { useReviewsInit } from '@hooks/reviews/useInit';
import { TemplateProvider } from '@lib/reviews/note/template';
import { useAtomValue } from 'jotai';
function NoteHelper() {
  const { card, note, noteId } = useReviewsInit();
  const open = useAtomValue(DisplayAnswer);
  if (!noteId || !note) {
    return <LoadingSpinner />;
  }

  const source = note?.source ?? '';
  const { FrontTemplate, BackTemplate } = TemplateProvider.getTemplate(source);

  return (
    <>
      <FrontTemplate note={note} />
      <BackTemplate open={open} note={note} />
    </>
  );
}

export default NoteHelper;
