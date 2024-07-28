import { DeckCrud } from '@lib/deck/crud';

export default async function DeckStatus({
  timezone,
  hourOffset,
  did,
}: {
  timezone: string;
  hourOffset: number;
  did: number;
}) {
  const detail = await DeckCrud.detail(did, timezone, hourOffset);
  console.log(detail);
  return <div>{JSON.stringify(detail)}</div>;
}
