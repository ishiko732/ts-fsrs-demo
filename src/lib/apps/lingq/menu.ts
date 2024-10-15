import { TAppMenuData } from '../types';
import { PullLingqsData } from './menus/pull-lingq';

// src\page\deck\actions.tsx
const actions = [
  {
    name: 'Pull Lingqs',
    action: PullLingqsData,
  },
];

export const LingqAppMenu = {
  allow_service: 'Lingq Service',
  menu: actions,
} as TAppMenuData;
