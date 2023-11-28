import {createEmptyCard, Card, Revlog, State} from "ts-fsrs";
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

  export const  Grades = [
    Rating.Again,
    Rating.Hard,
    Rating.Good,
    Rating.Easy,
  ];

}

interface NodeData{
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