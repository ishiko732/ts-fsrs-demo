import clsx from "clsx";
import React from "react";

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
}: Props) {
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
