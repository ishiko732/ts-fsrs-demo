import { atom } from 'jotai';
import { default_enable_fuzz, defualt_enable_short_term } from 'ts-fsrs';

export const fuzz = atom(default_enable_fuzz);
export const shortTerm = atom(defualt_enable_short_term);
export const openProfile = atom(false);
export const deckId = atom(0);