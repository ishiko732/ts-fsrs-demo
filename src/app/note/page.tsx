import getFormattedDate from "@/lib/format";
import { getNotes } from "@/lib/note";
import Link from "next/link";
import React, { cache } from "react";
import { Card, Note, State } from "@prisma/client";
import Menu from "@/components/menu";
import { getAuthSession } from "@/auth/api/auth/[...nextauth]/session";

const getData = cache(async (start: number, searchWord: string) => {
  console.log("cache miss:" + start);
  const session = await getAuthSession();
  const subNotes: { [key: string]: Array<Note & { card: Card }> } = {};
  var newCnt = 0;
  var learningCnt = 0;
  var reviewCnt = 0;
  if (!session?.user) {
    return {
      subNotes,
      newCnt,
      learningCnt,
      reviewCnt,
    };
  }
  const notes = await getNotes({
    uid: Number(session.user.id),
    take: start === 0 ? undefined : start,
    query: { question: { contains: searchWord } },
    order: { card: { due: "desc" } },
  });
  notes.forEach((note) => {
    if (note.answer.length > 0) {
      const category = note.question.substring(0, 1).toUpperCase();
      if (!subNotes[category]) {
        subNotes[category] = [];
      }
      subNotes[category].push(note);
    } else {
      if (!subNotes["#"]) {
        subNotes["#"] = [];
      }
      subNotes["#"].push(note);
    }
    switch (note.card.state) {
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
    }
  });
  return {
    subNotes,
    newCnt,
    learningCnt,
    reviewCnt,
  };
});

export default async function Page({
  searchParams,
}: {
  searchParams: { take: string; s: string };
}) {
  const take = searchParams["take"] ? Number(searchParams["take"]) : 0;
  const searchWord = searchParams["s"] ? searchParams["s"] : "";
  const { subNotes, newCnt, learningCnt, reviewCnt } = await getData(
    take,
    searchWord
  );

  return (
    <div className="bg-base-200 h-screen">
      <div className="w-full sm:flex sm:flex-wrap sm:justify-center bg-base-200">
      <div className="menu-title flex justify-start text-lg">
        Notes {`New:${newCnt},Learning:${learningCnt},Review:${reviewCnt}`}
      </div>
      <Menu />
        <div className="w-full sm:flex sm:flex-wrap sm:justify-center ">
              <ul className="menu bg-base-200 rounded-box w-full sm:w-1/2">
                {Object.keys(subNotes)
                  .sort()
                  .map((key:string, index:number) => (
                    <li key={key}>
                      <details
                        open={
                          index == 0 ||
                          (searchWord !== null && searchWord !== "")
                        }
                      >
                        <summary className="text-lg">{key}</summary>
                        <ul>
                          {subNotes[key].map((note) => (
                            <li key={note.nid}  >
                              <Link href={`/note/${note.nid}`} legacyBehavior>
                                <div className="w-full">
                                  <div className="text-lg">{note.question}</div>
                                  <div className="text-sm">
                                    {`(${
                                      note.card.state
                                    })next:${getFormattedDate(
                                      note.card!.due
                                    )}`}
                                  </div>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ))}
              </ul>
        </div>
      </div>
    </div>
  );
}
