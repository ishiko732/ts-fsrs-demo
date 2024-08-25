import {
  Prisma,
  State as PrismaState,
  Card as PrismaCard,
  Note as PrismaNote,
} from '@prisma/client';
import { CardService, DeckService, NoteService } from '@lib/reviews';
import { RecordLog } from 'ts-fsrs';

interface NodeData {
  question: string;
  answer: string;
  extend: string;
  source: string;
}

interface ProgeigoNodeData {
  '🔒Row ID': string;
  $rowIndex: number;
  column1: string;
  分類: string;
  英単語: string;
  品詞: string;
  意味: string;
  例文: string;
  例文訳: string;
  解説: string;
  発音: string;
  ビデオ: string;
}

interface NoteFormData {
  question: string;
  answer: string;
  extend: string;
}

export type FSRSPutParams = {
  uid: number;
  request_retention: number;
  maximum_interval: number;
  w: number[];
  enable_fuzz: boolean;
  enable_short_term: boolean;
  lapses: number;
  card_limit: number;
  lingq_token: string | null;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      GITHUB_ID: string;
      GITHUB_SECRET: string;
      GITHUB_ADMIN_ID: string;
      CRON_SECRET: string;
      CRYPT_SECRET: string;
    }
  }

  interface Window {
    container: {
      current: {
        record: RecordLog;
        type: PrismaState;
      };
      media: {
        card: PrismaCard;
        note: PrismaNote;
      };
      svc: {
        card: CardService;
        note: NoteService;
        deck: DeckService;
      };
      keypressed?: {
        code: string;
        open: boolean;
        cid?: number;
      };
    };
    extra: {
      [key?: string]: any;
    };
  }
}

type Required<T, K extends keyof T> = T & {
  [key in K]-?: T[key];
};

export type CardUpdateRequired = Required<
  Prisma.CardUncheckedUpdateInput,
  | 'due'
  | 'stability'
  | 'difficulty'
  | 'elapsed_days'
  | 'scheduled_days'
  | 'reps'
  | 'lapses'
  | 'state'
  | 'last_review'
  | 'suspended'
>;

export type RevlogUpdateRequired = Required<
  Prisma.RevlogUncheckedUpdateInput,
  | 'grade'
  | 'state'
  | 'due'
  | 'stability'
  | 'difficulty'
  | 'elapsed_days'
  | 'last_elapsed_days'
  | 'scheduled_days'
  | 'review'
  | 'duration'
>;

export type CardUpdatePayload = CardUpdateRequired & {
  logs: {
    create: RevlogUpdateRequired;
  };
};

export type UserCreatedRequired = Required<
  Prisma.UserCreateInput,
  'oauthId' | 'oauthType' | 'email'
>;
