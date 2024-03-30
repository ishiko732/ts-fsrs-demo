"use client";
import { useState } from "react";

export default function RescheduledSubmitButton({
  action,
}: {
  action: (page: number, pageSize: number) => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);
  const pageSize = 50;
  const handleRescheduleHandler = async () => {
    setLoading(true);
    console.time("reschedule");
    let page = 0;
    let waits = [];
    let ret;
    do {
      // vercel serverless function has a 10s timeout
      for (let i = 1; i < 10; i++) {
        waits.push(action(page * 10 + i, pageSize));
      }
      ret = (await Promise.all(waits)).every((p) => p);
      waits = [];
      page++;
    } while (ret);
    setLoading(false);
    console.timeEnd("reschedule");
    window.location.reload();
  };
  return (
    <button disabled={loading} type="submit" onClick={handleRescheduleHandler}>
      {loading ? (
        <span className="flex mx-auto h-6 loading loading-spinner loading-sm"></span>
      ) : (
        <RefreshIcon />
      )}
    </button>
  );
}

function RefreshIcon() {
  return (
    <svg
      className={"w-6 h-6 fill-blank dark:fill-white"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 7.1601562 3 L 8.7617188 5 L 18 5 C 18.551 5 19 5.448 19 6 L 19 15 L 16 15 L 20 20 L 24 15 L 21 15 L 21 6 C 21 4.346 19.654 3 18 3 L 7.1601562 3 z M 4 4 L 0 9 L 3 9 L 3 18 C 3 19.654 4.346 21 6 21 L 16.839844 21 L 15.238281 19 L 6 19 C 5.449 19 5 18.552 5 18 L 5 9 L 8 9 L 4 4 z"></path>
    </svg>
  );
}
