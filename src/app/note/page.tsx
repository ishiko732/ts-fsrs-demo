import React, { cache } from 'react';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import {
  getNoteTotalCount,
  getNotesBySessionUserId,
} from '@/actions/userNoteService';
import DataTable from '@/components/note/data-table';
import { getUserParams } from '@/actions/userParamsService';
import { generatorParameters } from 'ts-fsrs';

export const revalidate = 0; // no cache

// interface IndexPageProps {
//   searchParams: {
//     [key: string]: string | string[] | undefined;
//   };
// }

function computerOrder(order: { field: string; type: 'desc' | 'asc' }) {
  let _order:
    | Prisma.NoteOrderByWithRelationInput
    | Prisma.NoteOrderByWithRelationInput[]
    | undefined = {};
  if (
    ['question', 'answer', 'source', 'due', 'state', 'reps', 's', 'd'].includes(
      order.field
    )
  ) {
    if (['question', 'answer', 'source'].includes(order.field)) {
      _order = {
        [order.field]: order.type,
      };
    } else {
      if (order.field === 's') {
        order.field = 'stability';
      } else if (order.field === 'd') {
        order.field = 'difficulty';
      }
      _order = {
        card: {
          [order.field]: order.type,
        },
      };
    }
  } else {
    _order = { card: { due: 'desc' } };
  }
  return _order;
}

const getData = cache(
  async (
    take: number,
    searchWord: string,
    pageIndex: number = 1,
    order: { field: string; type: 'desc' | 'asc' },
    deleted: '1' | '0' = '0'
  ) => {
    const _noteCount = getNoteTotalCount({
      query: { question: { contains: searchWord }, deleted: deleted === '1' },
    });
    const _notes = getNotesBySessionUserId({
      take: take === 0 ? undefined : take,
      skip: take * (pageIndex - 1),
      query: { question: { contains: searchWord }, deleted: deleted === '1' },
      order: computerOrder(order),
    });
    const [noteCount, notes] = await Promise.all([_noteCount, _notes]).catch(
      () => {
        redirect('/api/auth/signin?callbackUrl=/note');
      }
    );
    const pageCount = Math.ceil(noteCount / take);
    return {
      notes: notes,
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
    ot: 'desc' | 'asc';
    page: string;
    deleted: '1' | '0';
  };
}) {
  const take = Number(searchParams['take']);
  const pageIndex = Number(searchParams['page']);
  if (
    !Number.isInteger(take) ||
    !Number.isInteger(pageIndex) ||
    pageIndex < 1 ||
    take < 1
  ) {
    redirect('/note?page=1&take=15');
  }
  const searchWord = searchParams['s'] ? searchParams['s'] : '';
  const orderField = searchParams['o'] ? searchParams['o'] : 'due';
  const orderType = searchParams['ot'] ? searchParams['ot'] : 'desc';
  const deleted = searchParams['deleted'] ? searchParams['deleted'] : '0';
  const { notes, pageCount, noteCount } = await getData(
    take,
    searchWord as string,
    pageIndex,
    {
      field: orderField as string,
      type: orderType as 'desc' | 'asc',
    },
    deleted as '1' | '0'
  );

  const params = await getUserParams();
  return (
    <div className=' container'>
      <DataTable
        data={notes}
        fsrsParams={generatorParameters(params.data?.params)}
        rowCount={noteCount}
        pageCount={pageCount}
      />
    </div>
  );
}
