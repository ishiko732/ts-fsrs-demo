import DateItem from "@/lib/formatDate";
import { getNoteCount, getNotes } from "@/lib/note";
import Link from "next/link";
import React, { cache } from "react";
import { Card, Note, Prisma } from "@prisma/client";
import Menu from "@/components/menu";
import { getAuthSession } from "@/auth/api/auth/[...nextauth]/session";
import { fsrs } from "ts-fsrs";
import clsx from "clsx";
import TableHeader from "@/components/note/NoteTableHead";
import NotePagination from "@/components/note/NotePagination";
import DeleteNoteButton from "@/components/dangerous/DeleteNode/DeleteNoteButton";
import TableStopPropagationEvent from "@/components/note/TableStopEvent";

function computerOrder(order: { field: string; type: "desc" | "asc" }) {
  let _order:
    | Prisma.NoteOrderByWithRelationInput
    | Prisma.NoteOrderByWithRelationInput[]
    | undefined = {};
  if (
    ["question", "answer", "source", "due", "state", "reps"].includes(
      order.field
    )
  ) {
    if (["question", "answer", "source"].includes(order.field)) {
      _order = {
        [order.field]: order.type,
      };
    } else {
      _order = {
        card: {
          [order.field]: order.type,
        },
      };
    }
  } else {
    _order = { card: { due: "desc" } };
  }
  return _order;
}

const getData = cache(
  async (
    start: number,
    searchWord: string,
    pageIndex: number = 1,
    order: { field: string; type: "desc" | "asc" }
  ) => {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        notes: [],
        pageCount: 0,
        noteCount: 0,
      };
    }
    const _noteCount = getNoteCount({
      uid: Number(session.user.id),
      query: { question: { contains: searchWord } },
    });
    const _notes = getNotes({
      uid: Number(session.user.id),
      take: start === 0 ? undefined : start,
      skip: 500 * (pageIndex - 1),
      query: { question: { contains: searchWord } },
      order: computerOrder(order),
    });
    const [noteCount, notes] = await Promise.all([_noteCount, _notes]);
    const pageCount = Math.ceil(noteCount / 500);
    return {
      notes: notes as Array<Note & { card: Card }>,
      pageCount,
      noteCount,
    };
  }
);

export default async function Page({
  searchParams,
}: {
  searchParams: {
    take: string;
    s: string;
    o: string;
    ot: "desc" | "asc";
    page: string;
  };
}) {
  const take = searchParams["take"] ? Number(searchParams["take"]) : 500;
  const searchWord = searchParams["s"] ? searchParams["s"] : "";
  const orderField = searchParams["o"] ? searchParams["o"] : "due";
  const orderType = searchParams["ot"] ? searchParams["ot"] : "desc";
  const pageIndex = searchParams["page"] ? Number(searchParams["page"]) : 1;
  const { notes, pageCount, noteCount } = await getData(
    take,
    searchWord,
    pageIndex,
    {
      field: orderField,
      type: orderType,
    }
  );
  const f = fsrs();
  const now = new Date();
  return (
    <div className="bg-base-200 h-screen">
      <div className="w-full sm:flex sm:flex-wrap sm:justify-center bg-base-200">
        <Menu />
        <div className="w-3/4 sm:flex sm:flex-wrap sm:justify-center pt-8">
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm table-zebra">
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {notes.map((note: Note & { card: Card }, i: number) => (
                  <Link
                    legacyBehavior
                    href={`/note/${note.nid}`}
                    key={note.nid}
                  >
                    <tr
                      className={clsx(
                        "hover",
                        "cursor-pointer",
                        note.card.suspended ? "bg-yellow-300" : ""
                      )}
                    >
                      <th className="hidden sm:table-cell">
                        {(pageIndex - 1) * take + i + 1}
                      </th>
                      <td>{note.question}</td>
                      <td className="hidden sm:table-cell">{note.answer}</td>
                      <td
                        className="hidden sm:table-cell"
                        title={`${note.source}${note.sourceId ?? ""}`}
                      >
                        {note.source}
                      </td>
                      <td className="hidden sm:table-cell">
                        {note.card.difficulty.toFixed(2)}
                      </td>
                      <td className="hidden sm:table-cell">
                        {note.card.stability.toFixed(2)}
                      </td>
                      <td className="hidden sm:table-cell">
                        {f.get_retrievability(note.card, now) ?? "/"}
                      </td>
                      <td>
                        <DateItem date={note.card.due}></DateItem>
                      </td>
                      <td>{note.card.state}</td>
                      <td className="hidden sm:table-cell">{note.card.reps}</td>
                      <TableStopPropagationEvent><DeleteNoteButton nid={note.nid} className="btn-xs"/></TableStopPropagationEvent>
                    </tr>
                  </Link>
                ))}
              </tbody>
              <tfoot>
                <TableHeader />
              </tfoot>
            </table>
            <NotePagination
              cur={pageIndex}
              count={pageCount}
              total={noteCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
