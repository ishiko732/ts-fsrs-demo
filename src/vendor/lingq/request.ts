
const BaseUrl = 'https://www.lingq.com/api/';

async function streamToString(stream: ReadableStream) {
    const reader = stream.getReader();
    let body = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        body += new TextDecoder("utf-8").decode(value);
    }
    return body.length > 0 ? body : null;
}

export async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(path, BaseUrl);
    if (options.body != null && options.body instanceof ReadableStream) {
        options.body = await streamToString(options.body);
    }
    if ((options.method === 'GET' || options.method === 'HEAD')) {
        if (options.body != null) {
            const params = JSON.parse(options.body as string) as { [key: string]: string };
            for (const [key, value] of Object.entries(params)) {
                if (value) url.searchParams.append(key, value);
            }
        }
        options.body = undefined;
    }
    const response = await fetch(url.toString(), {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Token ${token}`,
            ...options.headers,
        },
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}

export async function getLingqContext({ page_size, page, token }: { language: languageCode, page_size?: number, page?: number, token: string }): Promise<Contexts> {
    return request<Contexts>('v2/contexts/', token, { body: JSON.stringify({ page_size, page }), method: 'GET' });
}


export async function getLingqs({ language, page_size, page, token }: { language: languageCode, page_size?: number, page?: number, token: string }): Promise<Lingqs> {
    return request<Lingqs>(`v3/${language}/cards/`, token, { body: JSON.stringify({ page_size, page }), method: 'GET' });
}

export async function getLingq({ language, id, token }: { language: languageCode, id: number, token: string }): Promise<Lingq> {
    return request<Lingq>(`v3/${language}/cards/${id}/`, token);
}

export async function changeLingqStatus({ language, id, status, extended_status, token }: { language: languageCode, id: number, status: LingqStatus, extended_status: LingqExtendedStatus, token: string }): Promise<Lingq> {
    return request<Lingq>(`v3/${language}/cards/${id}/`, token, { body: JSON.stringify({ status, extended_status }), method: 'PATCH' });
}