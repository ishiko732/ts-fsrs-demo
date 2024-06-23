import { cn } from '@/lib/utils';
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  tip?: string;
  className?: string;
  children: React.ReactNode;
  onClick?:
    | ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    | (() => void);
  formAction?: ((formData: FormData) => void) | string | undefined;
  dialog?: React.ReactNode;
  disable?: boolean;
};

export default async function MenuItem({
  tip,
  className,
  children,
  onClick,
  formAction,
  dialog,
  disable,
}: Props) {
  if (disable === true) {
    return null;
  }
  return formAction ? (
    <form action={formAction}>
      <MenuItemContent
        tip={tip}
        className={className}
        onClick={onClick}
        dialog={dialog}
      >
        {children}
      </MenuItemContent>
    </form>
  ) : (
    <MenuItemContent
      tip={tip}
      className={className}
      onClick={onClick}
      dialog={dialog}
    >
      {children}
    </MenuItemContent>
  );
}
async function MenuItemContent({
  tip,
  className,
  children,
  onClick,
  dialog,
}: Props) {
  return (
    <>
      <li onClick={onClick} className='max-w-[54px] max-h-10' aria-label={tip}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(className)}>
                {children}
              </div>
            </TooltipTrigger>
            <TooltipContent side='right' >
              <p>{tip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </li>
      {dialog || null}
    </>
  );
}
