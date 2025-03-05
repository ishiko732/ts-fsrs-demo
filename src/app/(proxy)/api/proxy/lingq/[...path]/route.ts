import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// target: "https://www.lingq.com/api/:path"
const handler = async (request: NextRequest, params: { params: { path: string[] } }) => {
  const method = request.method // METHOD
  const headersList = headers()
  const token = headersList.get('authorization') ?? '' // TOKEN
  const userAgent = headersList.get('user-agent') ?? '' // USER-AGENT
  const contentType = headersList.get('content-type')
  const searchParams = request.nextUrl.searchParams

  // build target URL
  let targetUrl = `https://www.lingq.com/api/${params.params.path.join('/')}`
  if (searchParams.size > 0) {
    targetUrl += `?${searchParams.toString()}`
  }
  // build request options
  let body: string | FormData | null = null
  try {
    if (contentType?.includes('application/json')) {
      body = JSON.stringify(await request.json()) as string
    } else if (contentType?.includes('multipart/form-data')) {
      body = await request.formData()
    } else {
      body = await request.text()
    }
  } catch (error) {
    console.error(`[${method}:${targetUrl}]Error parsing request: ${error}`)
    return NextResponse.json({ message: 'Error parsing request', url: targetUrl, method }, { status: 400 })
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
      body: request.method !== 'GET' && request.method !== 'HEAD' ? body : null,
    })

    // return response from target server
    const responseData = await response.json()
    return NextResponse.json(responseData, { status: response.status })
  } catch (error) {
    console.error(`[${method}:${targetUrl}]Error forwarding request: ${error}`)
    return NextResponse.json({ message: 'Error forwarding request', url: targetUrl, method }, { status: 502 })
  }
}

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT }
