import { getNoteCount, getNotes } from "@/lib/note";
import React, { cache } from "react";
import { Card, Note, Prisma } from "@prisma/client";
import Menu from "@/components/menu";
import { getAuthSession } from "@/auth/api/auth/[...nextauth]/session";
import TableHeader from "@/components/note/NoteTableHead";
import NotePagination from "@/components/note/NotePagination";
import NoteTableBody from "@/components/note/NoteTableBody";

function computerOrder(order: { field: string; type: "desc" | "asc" }) {
  let _order:
    | Prisma.NoteOrderByWithRelationInput
    | Prisma.NoteOrderByWithRelationInput[]
    | undefined = {};
  if (
    ["question", "answer", "source", "due", "state", "reps", "s", "d"].includes(
      order.field
    )
  ) {
    if (["question", "answer", "source"].includes(order.field)) {
      _order = {
        [order.field]: order.type,
      };
    } else {
      if (order.field === "s"){
        order.field = "stability";
      }else if (order.field === "d") {
        order.field = "difficulty";
      }
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
    take: number,
    searchWord: string,
    pageIndex: number = 1,
    order: { field: string; type: "desc" | "asc" },
    deleted: '1' | '0' = '0'
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
      query: { question: { contains: searchWord }, deleted: deleted === '1' },
    });
    const _notes = getNotes({
      uid: Number(session.user.id),
      take: take === 0 ? undefined : take,
      skip: take * (pageIndex - 1),
      query: { question: { contains: searchWord }, deleted: deleted === '1' },
      order: computerOrder(order),
    });
    const [noteCount, notes] = await Promise.all([_noteCount, _notes]);
    const pageCount = Math.ceil(noteCount / take);
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
    deleted: '1' | '0';
  };
}) {
  const take = searchParams["take"] ? Number(searchParams["take"]) : 100;
  const searchWord = searchParams["s"] ? searchParams["s"] : "";
  const orderField = searchParams["o"] ? searchParams["o"] : "due";
  const orderType = searchParams["ot"] ? searchParams["ot"] : "desc";
  const pageIndex = searchParams["page"] ? Number(searchParams["page"]) : 1;
  const deleted = searchParams["deleted"] ? searchParams["deleted"] : "0";
  const { notes, pageCount, noteCount } = await getData(
    take,
    searchWord,
    pageIndex,
    {
      field: orderField,
      type: orderType,
    },
    deleted
  );
  return (
    <div className="bg-base-200 h-screen">
      <div className="w-full sm:flex sm:flex-wrap sm:justify-center bg-base-200">
        <Menu />
        <div className="w-full sm:w-3/4 sm:flex sm:flex-wrap sm:justify-center pt-8">
          <div className="overflow-x-auto">
            <table className="table table-xs sm:table-sm table-zebra">
              <thead>
                <TableHeader />
              </thead>
              <tbody>
               <NoteTableBody pageIndex={pageIndex} take={take} notes={notes}/>
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
