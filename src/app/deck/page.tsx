import { DeckService } from '@lib/deck';
import { getUserTimeZone } from '@actions/userTimezone';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const deckService = new DeckService(0);
  const { uid, timezone, hourOffset } = await getUserTimeZone();
  const fsrs = await deckService.getAlgorithm();
  const deckContext = await deckService.getTodayMemoryContext(
    timezone,
    hourOffset
  );
  console.log(fsrs.parameters);

  return <div>{JSON.stringify(deckContext)}</div>;
}
