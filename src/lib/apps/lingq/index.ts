import { getNotExistSourceIds } from '@actions/useExtraService';
import { IAppService, ToastType } from '../types';
import { changeLingqStatus, getLingqContext, getLingqs } from './request';
import { TAppPrams, TGetLingqs } from './types';
import { noteCrud } from '@lib/container';
import { Note, State } from '@prisma/client';
import { TEmitCardScheduler } from '@lib/reviews/type';
import { toastEmitter } from '@hooks/useToastListeners';

const source = 'lingq';
const pageSize = 50;
export class LingqService implements IAppService<TAppPrams, void> {
  allowCall(source: string) {
    return source === 'lingq' || source === 'Lingq Service';
  }
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

  async pull(deckId: number, params: TAppPrams) {
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
      toastEmitter.emitToast({
        title: 'Lingq Service - success',
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
        toastEmitter.emitToast({
          title: 'Lingq Service - success',
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
      .join(';');
  }

  async sync(params: TAppPrams, note: Note, scheduler: TEmitCardScheduler) {
    if (!params.token) {
      throw new Error('Lingq Token is required');
    }
    const { status, extended_status } = this.checkReviewStatus(
      scheduler.nextState,
      scheduler.nextDue
    );

    const formData = new FormData();
    formData.append('status', status.toString());
    formData.append('extended_status', extended_status.toString());
    const data = await changeLingqStatus({
      language: params.language as languageCode,
      id: Number(note.sourceId),
      token: params.token,
      status,
      extended_status,
    });
  }

  private checkReviewStatus(
    nextState: TEmitCardScheduler['nextState'],
    nextDue: TEmitCardScheduler['nextDue']
  ) {
    let status = 0;
    let extended_status = 0;
    if (nextState != State.Review) {
      status = 0; // LingqStatus.New;
      extended_status = 0; //LingqExtendedStatus.Learning;
    } else if (nextDue) {
      const now = new Date().getTime();
      const diff = Math.floor((nextDue - now) / (1000 * 60 * 60 * 24));
      //Ref https://github.com/thags/lingqAnkiSync/issues/34
      if (diff > 15) {
        status = 3; // LingqStatus.Learned;
        extended_status = 3; // LingqExtendedStatus.Known;
      } else if (diff > 7 && diff <= 15) {
        status = 3; // LingqStatus.Learned;
        extended_status = 0; //LingqExtendedStatus.Learning;
      } else if (diff > 3 && diff <= 7) {
        status = 2; // LingqStatus.Familiar;
        extended_status = 0; // LingqExtendedStatus.Learning;
      } else {
        status = 1; // LingqStatus.Recognized;
        extended_status = 0; // LingqExtendedStatus.Learning;
      }
    }
    return { status, extended_status };
  }

  // push: (params: TAppPrams) => Promise<unknown>;
  // flow: (params: TAppPrams) => Promise<unknown>;
}
