import { TAppMenuData } from '../types';
import { FSRSReschedule } from './fsrs-reschedule';
import { InitProgeigoDates } from './init-progeigo';

// src\page\deck\actions.tsx
const actions = [
  {
    name: 'Init Progeigo',
    action: InitProgeigoDates,
  },
  {
    name: 'Reschedule',
    action: FSRSReschedule,
  },
];

export const GlobalAppMenu = {
  allow_service: 'Global Service',
  menu: actions,
} as TAppMenuData;
