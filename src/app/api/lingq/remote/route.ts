import { request as LingqRequest } from '@/lib/apps/lingq/request';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const remoteURL = url.searchParams.get('url');
  const remoteMethod = url.searchParams.get('method');
  const token = request.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'token not found' }, { status: 401 });
  }
  if (!remoteURL) {
    return NextResponse.json({ error: 'url not found' }, { status: 400 });
  }
  if (!remoteMethod) {
    return NextResponse.json({ error: 'method not found' }, { status: 400 });
  }
  const data = await LingqRequest(remoteURL, token, {
    method: remoteMethod,
    body: request.body,
  });
  return NextResponse.json(data);
}
