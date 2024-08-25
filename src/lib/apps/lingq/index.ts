import { getLingqContext, getLingqs } from './request';
import { TGetLingqs } from './types';

export class LingqService {
  // get data
  async getLingqLanguageCode(token: string) {
    return getLingqContext({ token });
  }

  async getLingqs({ token, language, page, page_size }: TGetLingqs) {
    const data = await getLingqs({
      language: language as languageCode,
      token: token,
      page: Number(page),
      page_size: Number(page_size),
      search_criteria: 'startsWith',
      sort: 'date',
      status: ['0', '1', '2', '3'],
    });
    return data;
  }
}
