import { DeckService } from '@lib/deck';
import { getUserTimeZone } from '@/actions/timezone';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const deckService = new DeckService();
  const { uid, timezone, hourOffset } = await getUserTimeZone();
  const fsrs = await deckService.getAlgorithm(uid);
  const deckContext = await deckService.getTodayMemoryContext(
    uid,
    timezone,
    hourOffset
  );
  console.log(fsrs.parameters);

  return <div>{JSON.stringify(deckContext)}</div>;
}
