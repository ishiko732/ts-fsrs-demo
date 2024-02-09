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

export type FSRSPutParams={
  uid: number;
  request_retention: number;
  maximum_interval: number;
  w: number[];
  enable_fuzz: boolean;
  card_limit: number;
  lingq_token: string| null;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      GITHUB_ID: string;
      GITHUB_SECRET: string;
      GITHUB_ADMIN_ID: string;
      LINGQ_KEY: string;
      CRON_SECRET: string;
    }
  }
}