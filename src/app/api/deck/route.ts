import { getSessionUserId } from '@/app/(auth)/api/auth/[...nextauth]/session';
import { get_timezones } from '@/lib/date';
import type { DeckMemoryState } from '@lib/deck/type';
import { DeckService } from '@lib/deck';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const uid = await getSessionUserId();
  if (!uid) {
    return NextResponse.json({ msg: 'uid not found' }, { status: 401 });
  }
  const url = new URL(request.url);
  const timezones = get_timezones();
  const timezone = url.searchParams.get('timezone') ?? 'UTC';
  const existed = !!~timezones.indexOf(timezone);
  const hourOffset = Math.min(
    0,
    Math.max(23, ~~(url.searchParams.get('hourOffset') ?? 4))
  );
  const deckService = new DeckService();
  const params = await deckService.getAlgorithmParams(uid);
  const deckContext = await deckService.getTodayMemoryContext(
    uid,
    existed ? timezone : 'UTC',
    hourOffset
  );
  Object.assign(deckContext, { params: params });
  return NextResponse.json(deckContext, { status: 200 });
}

// fetch("/api/deck?page=1", {
//     "headers": {
//         "accept": "*/*",
//         "accept-language": "zh-CN,zh;q=0.9,ja;q=0.8,en-US;q=0.7,en;q=0.6",
//         "content-type": "application/json",
//         "sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": "\"Windows\"",
//         "sec-fetch-dest": "empty",
//         "sec-fetch-mode": "cors",
//         "sec-fetch-site": "same-origin"
//     },
//     "referrer": "http://localhost:3000/api/deck",
//     "referrerPolicy": "strict-origin-when-cross-origin",
//     "body": "{\"uid\":1,\"timezone\":\"UTC\",\"startTimestamp\":1718136000000,\"nextTimestamp\":1718222400000,\"userNewCardlimit\":50,\"deckTodayLearnedcount\":0}",
//     "method": "PATCH",
//     "mode": "cors",
//     "credentials": "include"
// });
export async function PATCH(request: NextRequest) {
  const uid = await getSessionUserId();
  if (!uid) {
    return NextResponse.json({ msg: 'uid not found' }, { status: 401 });
  }
  const deckContext: DeckMemoryState & { ignoreIds?: number[] } =
    await request.json();
  const url = new URL(request.url);
  const page = +(url.searchParams.get('page') || '');
  if (page < 1) {
    return NextResponse.json(
      { msg: 'page must be greater than 0' },
      { status: 400 }
    );
  }
  if (deckContext?.uid !== uid) {
    return NextResponse.json({ msg: 'uid not match' }, { status: 400 });
  }
  const noteMemoryContext = await new DeckService().todayMemoryContextPage({
    ...deckContext,
    page,
    ignoreCardIds: deckContext.ignoreIds ?? [],
  });
  return NextResponse.json(noteMemoryContext, { status: 200 });
}
