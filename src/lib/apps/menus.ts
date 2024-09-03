import { GlobalAppMenu } from './global/menu';
import { LingqAppMenu } from './lingq/menu';
import { TAppMenuData } from './types';

export const AppMenus: TAppMenuData[] = [GlobalAppMenu, LingqAppMenu] as const;
