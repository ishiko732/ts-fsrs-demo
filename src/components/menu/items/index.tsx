import clsx from "clsx";
import React from "react";

type Props = {
  tip?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)|(()=>void);
  dialog?: React.ReactNode;
};

export default function MenuItem({
  tip,
  className,
  children,
  onClick,
  dialog,
}: Props) {
  return (
    <>
      <li onClick={onClick} className="max-w-[54px] max-h-6">
        <a className={clsx("tooltip tooltip-right", className)} data-tip={tip}>
          {children}
        </a>
      </li>
      {dialog || null}
    </>
  );
}
