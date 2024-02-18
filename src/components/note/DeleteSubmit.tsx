"use client";
import clsx from "clsx";
import { useState } from "react";

type Props = {
  nid: number;
  cid?: number;
  deleted: boolean;
  action: () => Promise<{
    nid: number;
    cid?: number;
  }>;
  restoreAction: (
    nid: number,
    cid?: number
  ) => Promise<boolean>;
} & React.ComponentProps<"button">;

export default function DeleteSubmit({
  action,
  restoreAction,
  nid,
  cid,
  deleted,
  ...props
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    nid: number;
    cid?: number;
  } | undefined>(deleted ? { nid, cid } : undefined);
  return (
    <button
      {...props}
      disabled={loading}
      className={clsx(props.className, !data ? "btn-error" : "btn-success")}
      onClick={async (e) => {
        setLoading(true);
        if (!data) {
          const ret = await action();
          setData(ret);
        } else {
          await restoreAction(data.nid, data.cid);
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
