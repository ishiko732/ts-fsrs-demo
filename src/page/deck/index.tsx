import { DeckCrud } from '@lib/deck/crud';
import DeckItem from './deck';
import { getUserTimeZone } from '@actions/userTimezone';

export default async function DeckPage() {
  // const deckService = new DeckService(0);
  // const { uid, timezone, hourOffset } = await getUserTimeZone();
  // const fsrs = await deckService.getAlgorithm();
  // const deckContext = await deckService.getTodayMemoryContext(
  //   timezone,
  //   hourOffset
  // );
  // console.log(fsrs.parameters);

  const deckCrud = new DeckCrud();
  const list = await deckCrud.getList();
  const { timezone, hourOffset } = await getUserTimeZone();
  return (
    <div className='container pt-4'>
      {list.map((deck) => (
        <DeckItem
          key={deck.did}
          deck={deck}
          selected={false}
          timezone={timezone}
          hourOffset={hourOffset}
        />
      ))}
    </div>
  );
}
