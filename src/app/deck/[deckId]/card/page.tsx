import { DeckService } from '@lib/reviews/deck';
import { HydrateAtoms } from './HydrateAtoms';
import { cardCrud, noteCrud } from '@lib/container';
import { CARD_NULL } from '@/constant';
import { ReviewContainer } from './Container';
import ReviewProvider from '@context/ReviewContext';
import { ReviewListener } from '../../review-listener';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: {
    deckId: string;
  };
  searchParams: {
    page: number;
    pageSize: number;
  };
};
export default async function Page({ params, searchParams }: PageProps) {
  const deckSvc = new DeckService(Number(params.deckId));
  const { page, pageSize } = searchParams;
  const fsrs_params = await deckSvc.getAlgorithmParams();
  const context = await deckSvc.getTodayMemoryContext();
  if (page > 1) {
    deckSvc.hydrate(context);
    const noteContext = await deckSvc.todayMemoryContextPage(page);
    context.noteContext = noteContext;
  }
  const noteIds = context.noteContext.memoryState.map((note) => note.noteId);
  const cardIds = context.noteContext.memoryState
    .map((note) => note.cardId)
    .filter((cardId) => cardId !== CARD_NULL);
  const [notes, cards] = await Promise.all([
    noteCrud.gets(noteIds),
    cardCrud.gets(cardIds),
  ]);

  return (
    <ReviewProvider>
      <ReviewListener />
      <HydrateAtoms
        deckContext={context}
        fsrsParams={fsrs_params}
        notes={notes}
        cards={cards}
      >
        <ReviewContainer />
      </HydrateAtoms>
    </ReviewProvider>
  );
}
