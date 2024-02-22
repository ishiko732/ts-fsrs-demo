"use client";
import { useState } from "react";

export default function SyncSubmitButton({
  action,
}: {
  action: () => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      type="submit"
      onClick={async () => {
        setLoading(true);
        const ret = await action();
        setLoading(false);
        ret && window.location.reload();
      }}
    >
      {loading ? (
        <span className="flex mx-auto h-6 loading loading-spinner loading-sm"></span>
      ) : (
        <SyncIcon />
      )}
    </button>
  );
}

function SyncIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      className={"w-6 h-6"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M21.5 14.98c-.02 0-.03 0-.05.01A3.49 3.49 0 0 0 18 12c-1.4 0-2.6.83-3.16 2.02A2.988 2.988 0 0 0 12 17c0 1.66 1.34 3 3 3l6.5-.02a2.5 2.5 0 0 0 0-5zM10 4.26v2.09C7.67 7.18 6 9.39 6 12c0 1.77.78 3.34 2 4.44V14h2v6H4v-2h2.73A7.942 7.942 0 0 1 4 12c0-3.73 2.55-6.85 6-7.74zM20 6h-2.73a7.98 7.98 0 0 1 2.66 5h-2.02c-.23-1.36-.93-2.55-1.91-3.44V10h-2V4h6v2z"></path>
    </svg>
  );
}
