import { SyncWaitUser, syncLingqs } from '@/vendor/lingq/sync';
import { kv } from "@vercel/kv";
import type { NextRequest } from 'next/server';

const globalForLingq = global as unknown as { syncUser?: SyncWaitUser[] };


export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }
    let users = null
    if (process.env.NODE_ENV === 'production') {
        users = await kv.get<SyncWaitUser[]>('lingq:syncUser');
    } else {
        users = globalForLingq.syncUser;
    }

    if (!users) {
        return Response.json({ success: false });
    }

    const promise: Promise<void>[] = []
    Array.from(users).forEach(async (user: SyncWaitUser) => {
        if (user.langs.length > 0) {
            user.langs.forEach((lang) => {
                promise.push(syncLingqs(user, lang))
            })
        }
    })
    await Promise.all(promise)
    if (process.env.NODE_ENV === 'production') {
        await kv.del('lingq:syncUser');
    }
    return Response.json({ success: true });
}

