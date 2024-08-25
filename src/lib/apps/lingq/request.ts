const BaseUrl = '/lingq/api';

async function streamToString(stream: ReadableStream) {
  const reader = stream.getReader();
  let body = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    body += new TextDecoder('utf-8').decode(value);
  }
  return body.length > 0 ? body : null;
}

export async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
  revalidate?: number
): Promise<T> {
  const url_path = BaseUrl + (path.startsWith('/') ? path : `/${path}`);
  const searchParams = new URLSearchParams();
  if (options.body != null && options.body instanceof ReadableStream) {
    options.body = await streamToString(options.body);
  }
  if (options.method === 'GET' || options.method === 'HEAD') {
    if (options.body != null) {
      const params = JSON.parse(options.body as string) as {
        [key: string]: string;
      };
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.append(key, value);
      }
    }
    options.body = undefined;
  }
  const Authorization = `Token ${token}`;
  console.log(url_path);
  const response = await fetch(
    `${url_path}${searchParams.size > 0 ? searchParams.toString() : ''}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization,
        ...options.headers,
      },
      next: {
        revalidate,
      },
    }
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

export async function getLingqContext({
  language,
  page_size,
  page,
  token,
}: {
  language?: languageCode;
  page_size?: number;
  page?: number;
  token: string;
}): Promise<Contexts> {
  return request<Contexts>('v2/contexts', token, {
    body: JSON.stringify({ language, page_size, page }),
    method: 'GET',
  });
}

export async function getLingqs({
  language,
  page_size,
  page,
  search_criteria,
  sort,
  status,
  token,
}: {
  language: languageCode;
  page_size?: number;
  page?: number;
  search_criteria?: string;
  sort?: string;
  status?: string[];
  token: string;
}): Promise<Lingqs> {
  return request<Lingqs>(`v3/${language}/cards/`, token, {
    body: JSON.stringify({ page_size, page, search_criteria, sort, status }),
    method: 'GET',
  });
}

export async function getLingq({
  language,
  id,
  token,
}: {
  language: languageCode;
  id: number;
  token: string;
}): Promise<Lingq> {
  return request<Lingq>(`v3/${language}/cards/${id}/`, token);
}

export async function changeLingqStatus({
  language,
  id,
  status,
  extended_status,
  token,
}: {
  language: languageCode;
  id: number;
  status: LingqStatus;
  extended_status: LingqExtendedStatus;
  token: string;
}): Promise<Lingq> {
  return request<Lingq>(`v3/${language}/cards/${id}/`, token, {
    body: JSON.stringify({ status, extended_status }),
    method: 'PATCH',
  });
}

export async function getLingqTTS({
  language,
  text,
  token,
}: {
  language: languageCode;
  text: string;
  token: string;
}): Promise<LingqTTS> {
  let app_name, voice;
  if (language === 'ja') {
    app_name = 'gCloudTTS';
    voice = 'ja-JP:male:ja-JP-Neural2-C';
  } else if (language === 'en') {
    app_name = 'msspeak';
    voice = 'en-US:Female';
  }
  if (!app_name || !voice) {
    throw new Error('language not supported');
  }

  return request<LingqTTS>(
    `v2/tts/`,
    token,
    {
      body: JSON.stringify({ app_name, voice, language, text }),
      method: 'GET',
    },
    1000 * 60 * 60 * 6
  );
}

export async function deleteHints({
  hintsId,
  token,
}: {
  hintsId: number;
  token: string;
}) {
  return request<LingqTTS>(`v2/hints/${hintsId}/`, token, {
    body: JSON.stringify({
      popularity: 0,
    }),
    method: 'PATCH',
  });
}

export async function getHints({
  hintsId,
  token,
}: {
  hintsId: number;
  token: string;
}) {
  return request<LingqTTS>(`v2/hints/${hintsId}/`, token, { method: 'GET' });
}

export async function searchHints({
  language,
  term,
  locale,
  token,
}: {
  language: languageCode;
  term: string;
  locale: string;
  token: string;
}) {
  return request<LingqTTS>(`/v2/${language}/hints/search/`, token, {
    body: JSON.stringify({
      term,
      locale,
      all: 1,
    }),
    method: 'GET',
  });
}

export async function changeLingqHints({
  language,
  cardId,
  token,
  hints,
}: {
  language: languageCode;
  cardId: number;
  token: string;
  hints: addLingqHint;
}): Promise<Lingqs> {
  return request<Lingqs>(`v3/${language}/cards/${cardId}/`, token, {
    body: JSON.stringify({ hints }),
    method: 'PATCH',
  });
}
