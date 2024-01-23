import {Card, Revlog, State} from "ts-fsrs";
export declare module "ts-fsrs" {
  interface CardPrisma extends Card {
    cid: number;
    due: Date;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
    reps: number;
    lapses: number;
    state: State;
    last_review?: Date;
    nid: string;
    note: note;
    logs?: revlog[];
  }
  interface RevlogPrisma extends Revlog {
    lid: string;
    cid: number;
    state: State;
    rating: Rating;
    due: Date;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    last_elapsed_days: number;
    scheduled_days: number;
    review:Date;
  }
}

interface NodeData{
  question:string;
  answer:string;
  extend:string;
  source:string;
}

interface ProgeigoNodeData{
    '🔒Row ID':string;
    '$rowIndex':number;
    'column1':string;
    '分類':string;
    '英単語':string;
    '品詞':string;
    '意味':string;
    '例文':string;
    '例文訳':string;
    '解説':string;
    '発音':string;
    'ビデオ':string;
}

interface NoteFormData{
  question: string;
  answer: string;
  extend: string;
}

export type StateBox = ExcludeReLearning<State>;
// StateBox:
// 0: New
// 1: Learning
// 2: Review

type ExcludeReLearning<T> = Exclude<T, State.Relearning>;


export type FSRSPutParams={
  uid: number;
  request_retention: number;
  maximum_interval: number;
  w: number[];
  enable_fuzz: boolean;
  card_limit: number;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      GITHUB_ID: string;
      GITHUB_SECRET: string;
      GITHUB_ADMIN_ID: string;
    }
  }
}