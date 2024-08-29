import type { useToast } from '@/components/ui/use-toast';

export type TAppData = {
  name: string;
  description?: string;
  component: (data: TAppProps) => React.ReactNode;
  service: typeof IAppService;
};

export type TAppProps<T extends object = object> = {
  install: boolean;
  params: T | null;
  installHandler: (params: object) => Promise<boolean>;
  removeHandler: () => Promise<boolean>;
};

export type ToastType = ReturnType<typeof useToast>['toast'];
export abstract class IAppService<T extends object = object, R = unknown> {
  abstract pull: (
    deckId: number,
    params: T,
    handleToast?: ToastType
  ) => Promise<R>;
  // abstract push: (params: T) => Promise<R>;
  // abstract sync: (params: T) => Promise<R>;
  // abstract flow: (params: T) => Promise<R>;
}
