
const BaseUrl = 'https://www.lingq.com/api/';

export async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(path, BaseUrl);
    if (options.method === 'GET' && options.body !== undefined && typeof options.body === 'string') {
        const params = JSON.parse(options.body as string) as { [key: string]: string };
        for (const [key, value] of Object.entries(params)) {
            if(value) url.searchParams.append(key, value);
        }
        options.body = undefined;
    } else if ((options.method === 'PATCH' || options.method === 'POST') && options.body !== undefined && typeof options.body === 'string') {
        const params = JSON.parse(options.body as string) as { [key: string]: string };
        const formData = new FormData()
        for (const [key, value] of Object.entries(params)) {
            if(value) formData.append(key, value);
        }
        options.body = formData;
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