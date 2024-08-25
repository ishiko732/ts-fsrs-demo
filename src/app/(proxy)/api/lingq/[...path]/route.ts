import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// target: "https://www.lingq.com/api/:path"
const handler = async (
  request: NextRequest,
  params: { params: { path: string[] } }
) => {
  const method = request.method; // METHOD
  const headersList = headers();
  const token = headersList.get('authorization') ?? ''; // TOKEN
  const userAgent = headersList.get('user-agent') ?? ''; // USER-AGENT
  const searchParams = request.nextUrl.searchParams;

  // build target URL
  let targetUrl = `https://www.lingq.com/api/${params.params.path.join('/')}`;
  if (searchParams.size > 0) {
    targetUrl += `?${searchParams.toString()}`;
  }
  // build request options
  let body;
  const contentType = headersList.get('content-type');
  if (contentType?.includes('application/json')) {
    body = await request.json();
  } else if (contentType?.includes('multipart/form-data')) {
    const formData = await request.formData();
    body = Object.fromEntries(formData.entries());
  } else {
    body = await request.text();
  }

  // send request to target server
  try {
    const response = await fetch(targetUrl, {
      method: method,
      headers: {
        'Content-Type': contentType || 'application/json',
        Authorization: token,
        'user-agent': userAgent,
      },
      body:
        request.method !== 'GET' && request.method !== 'HEAD'
          ? JSON.stringify(body)
          : null,
    });

    // return response from target server
    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error(`[${method}:${targetUrl}]Error forwarding request: ${error}`);
    return NextResponse.json(
      { message: 'Error forwarding request', url: targetUrl, method },
      { status: 500 }
    );
  }
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
