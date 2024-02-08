import { kv } from "@vercel/kv";

const globalForRevlog = global as unknown as {
  revlog?: { [key: number]: number };
};

export async function setSchedulerTime(cid: number, now: Date) {
  if (process.env.NODE_ENV === "production") {
    await kv.set(`revlog:${cid}`, JSON.stringify(now.getTime()));
    await kv.expire(`revlog:${cid}`, 60 * 20); // 20 min
  } else {
    if (!globalForRevlog.revlog) {
      globalForRevlog.revlog = {};
    }
    globalForRevlog.revlog[cid] = now.getTime();
  }
}

export async function getDuration(cid: number, now: Date) {
  let time = null;
  if (process.env.NODE_ENV === "production") {
    time = await kv.get<number>(`revlog:${cid}`);
  } else {
    if (!globalForRevlog.revlog) {
      globalForRevlog.revlog = {};
    }
    time = Number(globalForRevlog.revlog[cid]);
  }
  return time ? Math.floor((now.getTime() - time) / 1000) : 0;
}
