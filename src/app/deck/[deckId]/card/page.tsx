import { DeckService } from '@lib/reviews/deck';

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
  return (
    <>
      <div>TODO:{JSON.stringify(fsrs_params)}</div>
      <div>context:{JSON.stringify(context)}</div>
    </>
  );
}
