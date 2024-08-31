import { getNotExistSourceIds } from '@actions/useExtraService';
import { IAppService, ToastType } from '../types';
import { getLingqContext, getLingqs } from './request';
import { TAppPrams, TGetLingqs } from './types';
import { noteCrud } from '@lib/container';
import { Note } from '@prisma/client';

const source = 'lingq';
const pageSize = 50
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
        page_size: pageSize,
      });
      handleToast?.({
        title: 'success',
        description: `Page ${page} fetched`,
      });
      if (data.results.length === 0 || data.next === null) {
        break;
      }
      const hash: { [key: string]: Lingq } = {};
      const sourceIds = data.results.map((lingq) => {
        hash[`${lingq.pk}`] = lingq;
        return `${lingq.pk}`;
      });
      const notExistsSourceIds = await getNotExistSourceIds(
        deckId,
        source,
        sourceIds
      );
      if (notExistsSourceIds.length) {
        const notes: Omit<Note, 'did' | 'uid' | 'deleted' | 'nid'>[] = [];
        for (const sourceId of notExistsSourceIds) {
          const note = hash[sourceId];
          if (note) {
            notes.push({
              question: note.term.replace(/\s+/g, ''),
              answer: this.mergeTransliteration(note.transliteration),
              source: source,
              sourceId: sourceId,
              extend: {
                pk: note.pk,
                term: note.term,
                fragment: note.fragment,
                notes: note.notes,
                words: note.words,
                hints: note.hints,
                tags: note.tags,
                transliteration: note.transliteration,
                lang: params.language,
              },
            });
          }
        }
        const res = await noteCrud.creates(deckId, notes);
        handleToast?.({
          title: 'success',
          description: `Page ${page} created ${res} notes`,
        });
      } 
    } while (data.next);
  }

  private mergeTransliteration(transliteration: LingqTransliteration) {
    function mergeText(
      text:
        | string
        | string[]
        | { [key: string]: string }[]
        | { [key: string]: string }
    ) {
      if (text === undefined) {
        return '';
      }
      if (Array.isArray(text)) {
        let merge = '';
        for (let t of text) {
          merge += mergeText(t);
        }
        return merge;
      }
      if (typeof text === 'string') {
        return text;
      }
      return Object.keys(text)
        .map((key) => `${key}${text[key]}`)
        .join('');
    }
    return Object.keys(transliteration)
      .map((key) => `${key}:${mergeText(transliteration[key])}`)
      .join('');
  }
  // push: (params: TAppPrams) => Promise<unknown>;
  // sync: (params: TAppPrams) => Promise<unknown>;
  // flow: (params: TAppPrams) => Promise<unknown>;
}
