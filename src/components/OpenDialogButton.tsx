"use client";
import clsx from "clsx";

type Props = React.ComponentProps<"button"> & {
  dialogElement: string;
};

export default function OpenDialogButton({ dialogElement, ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx("btn", props.className)}
      onClick={(e) => {
        (
          document.getElementById(dialogElement) as HTMLDialogElement
        )?.showModal();
        props.onClick && props.onClick(e);
      }}
    >
      {props.children}
    </button>
  );
}
