import { getNotExistSourceIds } from '@actions/useExtraService';
import { IAppService, ToastType } from '../types';
import { getLingqContext, getLingqs } from './request';
import { TAppPrams, TGetLingqs } from './types';

export class LingqService implements IAppService<TAppPrams, void> {
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

  async pull(deckId: number, params: TAppPrams, handleToast?: ToastType) {
    let page = 0;
    let data;
    do {
      page++;
      data = await this.getLingqs({
        token: params.token,
        language: params.language as languageCode,
        page: page,
        page_size: 50,
      });
      handleToast?.({
        title: 'success',
        description: `Page ${page} fetched`,
      });
      if (data.results.length === 0 || data.next === null) {
        break;
      }
      // TODO
      // teExigetNotExistSourceIds()
    } while (data.next);
  }
  // push: (params: TAppPrams) => Promise<unknown>;
  // sync: (params: TAppPrams) => Promise<unknown>;
  // flow: (params: TAppPrams) => Promise<unknown>;
}
