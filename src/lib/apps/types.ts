type Constructor<T = any> = new (...args: any[]) => T;

export type TAppData = {
  name: string;
  description?: string;
  component: (data: TAppProps) => React.ReactNode;
  service: Constructor;
};

export type TAppProps<T extends object = object> = {
  install: boolean;
  params: T | null;
  installHandler: (params: object) => Promise<boolean>;
  removeHandler: () => Promise<boolean>;
};
