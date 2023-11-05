import getFormattedDate from "@/lib/format";
import { getNotes } from "@/lib/note";
import Link from "next/link";
import React, { cache } from "react";

export const getData = cache(async (start: number) => {
  console.log("cache miss:" + start);
  const notes = await getNotes({
    take: start === 0 ? undefined : start,
    order: { card: { due: "desc" } },
  });
  return notes;
});

export default async function Page({
  searchParams,
}: {
  searchParams: { take: string };
}) {
  const take = searchParams["take"] ? Number(searchParams["take"]) : 0;
  const notes = await getData(take);
  return (
    <>
      <ul className="menu bg-base-200 w-full rounded-box content-center">
        <li className="w-1/2">
          <h2 className="menu-title">Notes</h2>
          <ul className="text-base w-full">
            {notes.map((note) => (
              <li key={note.nid} className="w-full">
                <Link href={`/note/${note.nid}`}>
                  <div>
                    <div className="text-lg">
                    {note.question}
                    </div>
                    <div className="text-sm">
                    {`next Learning:${getFormattedDate(note.card!.due)}`}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </>
  );
}
