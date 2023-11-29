import getFormattedDate from "@/lib/format";
import {getNotes} from "@/lib/note";
import Link from "next/link";
import React, {cache} from "react";
import { State } from "@prisma/client";
import Menu from "@/components/menu";

const getData = cache(async (start: number,searchWord: string) => {
  console.log("cache miss:" + start);
  const notes = await getNotes({
    take: start === 0 ? undefined : start,
    query:{question:{contains:searchWord}},
    order: { card: { due: "desc" } },
  });
  return notes;
});

export default async function Page({
                                     searchParams,
                                   }: {
  searchParams: { take: string,s:string }
}) {
  const take = searchParams["take"] ? Number(searchParams["take"]) : 0;
  const searchWord = searchParams["s"] ? searchParams["s"] : "";
  console.log(searchWord)
  const notes = await getData(take,searchWord);
  var newCnt =0
  var learningCnt = 0
  var reviewCnt =0 ;
  notes.forEach((note) => {switch (note.card.state) {
    case State.New:
      newCnt++;
      break;
    case State.Learning:
    case State.Relearning:
      learningCnt++;
      break;
    case State.Review:
      reviewCnt++;
      break;
  }})

  return (
    <>
      <div className="w-full flex flex-wrap justify-center bg-base-200">
        <div className="w-full flex flex-wrap justify-center ">
          <ul className="menu  w-1/2 rounded-box">
            <li className="">
              <h2 className="menu-title">Notes {`New:${newCnt},Learning:${learningCnt},Review:${reviewCnt}`}</h2>
              <ul className="text-base w-full">
                {notes.map((note) => (
                  <li key={note.nid} className="w-full">
                    <Link href={`/note/${note.nid}`}>
                      <div>
                        <div className="text-lg">
                          {note.question}
                        </div>
                        <div className="text-sm">
                          {`(${note.card.state})next Learning:${getFormattedDate(note.card!.due)}`}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
        <Menu/>
      </div>

    </>
  );
}
