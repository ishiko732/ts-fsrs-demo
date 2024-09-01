import { TAppMenuData } from '../types';
import { InitProgeigoDates } from './init-progeigo';

// src\page\deck\actions.tsx
const actions = [
  {
    name: 'Init Progeigo',
    action: InitProgeigoDates,
  },
];

export const GlobalAppMenu = {
  allow_service: 'Global Service',
  menu: actions,
} as TAppMenuData;
