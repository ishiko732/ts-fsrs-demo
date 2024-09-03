import type { useToast } from '@/components/ui/use-toast';
import { TEmitCardScheduler } from '@lib/reviews/type';
import { Deck, Note } from '@prisma/client';

export type TAppData = {
  name: string;
  description?: string;
  component: (data: TAppProps) => React.ReactNode;
  service: typeof IAppService;
};

export type TAppMenuData = {
  allow_service: string;
  menu: {
    name: string;
    action: (data: TAppMenuAction) => React.ReactNode;
  }[];
};

export interface TAppMenuAction {
  deck: Deck;
  params: TAppProps['params'];
  className: string;
  note_size: number;
}

export type TAppProps<T extends object = object> = {
  install: boolean;
  params: T | null;
  installHandler: (params: object) => Promise<boolean>;
  removeHandler: () => Promise<boolean>;
};

export type ToastType = ReturnType<typeof useToast>['toast'];
export abstract class IAppService<T extends object = object, R = unknown> {
  abstract allowCall(source: string): boolean;
  abstract pull: (
    deckId: number,
    params: T,
    handleToast?: ToastType
  ) => Promise<R>;
  abstract sync: (
    params: T,
    note: Note,
    scheduler: TEmitCardScheduler
  ) => Promise<R>;
  // abstract sync: (params: T) => Promise<R>;
  // abstract flow: (params: T) => Promise<R>;
}
