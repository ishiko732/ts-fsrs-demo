import DeckItem from './deck';
import { getUserTimeZone } from '@actions/userTimezone';
import AddDeckItem from './add_deck';
import DeckDialog from './dialog';
import { deckCrud } from '@lib/container';

export default async function DeckPage({ deleted }: { deleted?: boolean }) {
  // const deckService = new DeckService(0);
  // const { uid, timezone, hourOffset } = await getUserTimeZone();
  // const fsrs = await deckService.getAlgorithm();
  // const deckContext = await deckService.getTodayMemoryContext(
  //   timezone,
  //   hourOffset
  // );
  // console.log(fsrs.parameters);

  const list = await deckCrud.getList(deleted ?? false);
  const { timezone, hourOffset } = await getUserTimeZone();
  return (
    <div className='container  pt-4 flex flex-wrap items-start'>
      <DeckDialog />
      {list.map((deck) => (
        <DeckItem
          key={deck.did}
          deck={deck}
          timezone={timezone}
          hourOffset={hourOffset}
        />
      ))}
      <AddDeckItem />
    </div>
  );
}
