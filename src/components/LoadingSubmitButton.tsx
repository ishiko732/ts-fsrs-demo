"use client";
import { useFormStatus } from "react-dom";

export default function LoadingSubmitButton({
  ...props
}: React.ComponentProps<"button">) {
  const { pending } = useFormStatus();

  return (
    <button
      className={props.className}
      type="submit"
      disabled={pending}
      {...props}
    >
      {pending ? (
        <>
          <span className="loading loading-spinner"></span>Processing
        </>
      ) : (
        props.children
      )}
    </button>
  );
}
