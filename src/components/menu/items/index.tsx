import clsx from "clsx";
import React from "react";

type Props = {
  tip?: string;
  className?: string;
  children: React.ReactNode;
  onClick?:
    | ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    | (() => void);
  formAction?: (formData: FormData) => void;
  dialog?: React.ReactNode;
};

export default async function MenuItem({
  tip,
  className,
  children,
  onClick,
  formAction,
  dialog,
}: Props) {
  return formAction && !onClick ? (
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
}: Partial<Props>) {
  return (
    <>
      <li onClick={onClick} className="max-w-[54px] max-h-10">
        <a className={clsx("tooltip tooltip-right", className)} data-tip={tip}>
          {children}
        </a>
      </li>
      {dialog || null}
    </>
  );
}
