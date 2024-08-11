import { DeckService } from '@lib/reviews/deck';
import StatusBar from './StatusBar';
import { HydrateAtoms } from './hydrateAtoms';
import { cardCrud, noteCrud } from '@lib/container';
import { CARD_NULL } from '@/constant';

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
    const noteContext = await deckSvc.todayMemoryContextPage({
      startTimestamp: context.startTimestamp,
      userNewCardlimit: context.userNewCardlimit,
      deckTodayLearnedcount: context.deckTodayLearnedcount,
      deckId: context.deckId,
      nextTimestamp: context.nextTimestamp,
      page: page,
      pageSize: Number(pageSize),
    });
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
    <HydrateAtoms
      deckContext={context}
      fsrsParams={fsrs_params}
      notes={notes}
      cards={cards}
    >
      <StatusBar />
    </HydrateAtoms>
  );
}
