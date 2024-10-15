import { TAppMenuData } from '../types';
import { ExportRevlog } from './export-revlog';
import { FSRSReschedule } from './fsrs-reschedule';
import { InitProgeigoDates } from './init-progeigo';

// src\page\deck\actions.tsx
const actions = [
  {
    name: 'Init Progeigo',
    action: InitProgeigoDates,
  },
  // {
  //   name: 'Reschedule',
  //   action: FSRSReschedule,
  // },
  {
    name: 'Export Revlog',
    action: ExportRevlog,
  },
];

export const GlobalAppMenu = {
  allow_service: 'Global Service',
  menu: actions,
} as TAppMenuData;
