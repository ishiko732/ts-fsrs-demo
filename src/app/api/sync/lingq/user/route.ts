import { SyncWaitUser, getLingqLanguageCode, syncUser } from '@/vendor/lingq/sync';
import { kv } from "@vercel/kv";
import { NextResponse, type NextRequest } from 'next/server';


const globalForLingq = global as unknown as { syncUser?: SyncWaitUser[] };

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }
  const users = await syncUser();

  const msg = users.map(async (user) => {
    return {
      ...user,
      langs: await getLingqLanguageCode(user)
    }
  })
  const data = await Promise.all(msg);
  if (process.env.NODE_ENV === 'production') {
    await kv.set('lingq:syncUser', JSON.stringify(data));
  } else {
    globalForLingq.syncUser = data;
  }
  return NextResponse.json({ success: true });
}

