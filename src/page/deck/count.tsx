import { DeckCrud } from '@lib/reviews/deck/crud';

export default async function DeckStatus({
  timezone,
  hourOffset,
  did,
}: {
  timezone: string;
  hourOffset: number;
  did: number;
}) {
  const total = await DeckCrud.total(did);
  const detail = await DeckCrud.detail(did, timezone, hourOffset);
  return<>
  total: <div>{JSON.stringify(total)}</div>
  detail: <div>{JSON.stringify(detail)}</div>
  </>;
}
