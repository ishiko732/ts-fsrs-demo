"use client";
import LoadingSubmitButton from "@/components/LoadingSubmitButton";
import { Card, Note, Revlog } from "@prisma/client";
import clsx from "clsx";
import { useState } from "react";

type Props = {
  action: () => Promise<{
    card: Card | undefined;
    revlog: Revlog[];
    note: Note;
  }>;
  restoreAction: (
    note: Note,
    revlog: Revlog[],
    card?: Card
  ) => Promise<boolean>;
} & React.ComponentProps<"button">;

export default function DeleteSubmit({
  action,
  restoreAction,
  ...props
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    card: Card | undefined;
    revlog: Revlog[];
    note: Note;
  }>();
  return (
    <button
      {...props}
      disabled={loading}
      className={clsx(props.className,!data?"btn-error":"btn-success")}
      onClick={async (e) => {
        setLoading(true);
        if (!data) {
          const ret = await action();
          setData(ret);
        } else {
          await restoreAction(data.note, data.revlog, data.card);
          setData(undefined);
        }
        setLoading(false);
      }}
    >
      {loading ? (
        <>
          <span className="loading loading-spinner"></span>Processing
        </>
      ) : data ? (
        "Restore"
      ) : (
        "Delete"
      )}
    </button>
  );
}
