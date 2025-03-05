"use client";
import { useFormStatus } from "react-dom";

import LoadingSpinner from "./loadingSpinner";
import { Button } from "./ui/button";


export default function LoadingSubmitButton({
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={props.className}
      type='submit'
      disabled={pending}
      {...props}
    >
      {pending ? (
        <>
          <LoadingSpinner/>
        </>
      ) : (
        props.children
      )}
    </Button>
  );
}
