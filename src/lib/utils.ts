import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function debounce<T extends (...args: any[]) => any>(func: T, delay: number = 200): T {
  let timeoutId: NodeJS.Timeout | null;

  return function debounced(this: any, ...args: Parameters<T>): ReturnType<T> | Promise<ReturnType<T>> {
      const context = this;

      const execute = () => {
          timeoutId = null;

          const result = func.apply(context, args);

          if (result instanceof Promise) {
              return result;
          } else {
              return Promise.resolve(result);
          }
      };

      if (timeoutId) {
          clearTimeout(timeoutId);
      }

      return new Promise((resolve) => {
          timeoutId = setTimeout(() => {
              const result = execute();
              resolve(result);
          }, delay);
      }) as Promise<ReturnType<T>>;
  } as T;
}