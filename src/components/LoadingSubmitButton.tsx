"use client";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import LoadingSpinner from "./loadingSpinner";


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
