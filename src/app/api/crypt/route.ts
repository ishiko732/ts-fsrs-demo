import { getKeyAction, setKeyAction } from '@actions/useExtraService';
import { NextResponse, NextRequest } from 'next/server';

export async function GET() {
  function buf2hex(buffer: ArrayBuffer) {
    // buffer is an ArrayBuffer
    return Array.from(new Uint8Array(buffer))
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
  }
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-CTR',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return NextResponse.json({ key: buf2hex(exported) });
}

export async function POST(request: NextRequest) {
  const json = (await request.json()) as
    | { token: string; type: 'get'; counter: string }
    | { key: string; type: 'set' };

  const key =
    json.type === 'set'
      ? await setKeyAction(json.key)
      : { key: await getKeyAction(json.token, json.counter) };

  return NextResponse.json({ ...key });
}
