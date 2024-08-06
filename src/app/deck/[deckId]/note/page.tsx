import React, { cache } from 'react';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import {
  getNoteTotalCount,
  getNotesBySessionUserId,
} from '@/actions/userNoteService';
import DataTable from '@/components/note/data-table';
import { generatorParameters } from 'ts-fsrs';
import { ColumnSort, SortingState } from '@tanstack/react-table';
import Menu from '@/components/menu';
import { deckCrud } from '@lib/container';

export const revalidate = 0; // no cache

function computerOrder(order: SortingState) {
  let sort: ColumnSort = {
    id: 'due',
    desc: false,
  };
  if (Array.isArray(order) && order.length > 0) {
    sort = order[0];
  }
  let _order:
    | Prisma.NoteOrderByWithRelationInput
    | Prisma.NoteOrderByWithRelationInput[]
    | undefined = {};
  if (
    ['question', 'answer', 'source', 'due', 'state', 'reps', 'S', 'D'].includes(
      sort.id
    )
  ) {
    if (['question', 'answer', 'source'].includes(sort.id)) {
      _order = {
        [sort.id]: sort.desc ? 'desc' : 'asc',
      };
    } else {
      if (sort.id === 'S') {
        sort.id = 'stability';
      } else if (sort.id === 'D') {
        sort.id = 'difficulty';
      }
      // _order = {
      //   cards: {
      //     [sort.id]: sort.desc ? 'desc' : 'asc',
      //   },
      // };
    }
  }
  return _order;
}

const querySQL = (
  deckId: number,
  searchWord: string,
  deleted: boolean
): { query: Prisma.NoteWhereInput } => {
  return {
    // mysql not support mode
    // mode: 'insensitive' property is not required and therefore not available in the generated Prisma Client API.
    // https://www.prisma.io/docs/orm/prisma-client/queries/case-sensitivity#mysql-provider

    // postgresql support mode
    // https://www.prisma.io/docs/orm/prisma-client/queries/case-sensitivity#postgresql-provider
    query: {
      OR: [
        {
          answer: { contains: searchWord, mode: 'insensitive' },
        },
        {
          question: { contains: searchWord, mode: 'insensitive' },
        },
      ],
      deleted: deleted,
      did: deckId,
    },
  };
};

const getData = async (
  deckId: number,
  take: number,
  searchWord: string,
  pageIndex: number = 1,
  order: SortingState,
  deleted: boolean
) => {
  const _noteCount = getNoteTotalCount(querySQL(deckId, searchWord, deleted));
  const _notes = getNotesBySessionUserId({
    take: take === 0 ? undefined : take,
    skip: take * (pageIndex - 1),
    ...querySQL(deckId, searchWord, deleted),
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
};

type NoteSortField =
  | 'question'
  | 'answer'
  | 'source'
  | 'D'
  | 'S'
  | 'R'
  | 'Reps';

type NotePageProps = {
  params: {
    deckId: string;
  };
  searchParams: {
    page: string;
    take: string;
    keyword: string;
    sort: NoteSortField;
    [key: string]: string | string[];
    deleted: '1' | '0';
  };
};

export default async function Page({ params, searchParams }: NotePageProps) {
  const deckId = Number(params.deckId ?? 0);
  const take = Number(searchParams['take']);
  const pageIndex = Number(searchParams['page']);
  if (
    !Number.isInteger(take) ||
    !Number.isInteger(pageIndex) ||
    pageIndex < 1 ||
    take < 1
  ) {
    redirect(`/deck/${deckId}/note?page=1&take=15`);
  }
  const keyword = searchParams.keyword ?? null;
  const sortField = searchParams.sort ?? [];
  const sort: SortingState | null = Array.isArray(searchParams.sort)
    ? Array.from(sortField).map((s) => {
        return {
          id: s,
          desc: searchParams[`${s}Asc`] === '0',
        };
      })
    : searchParams.sort
    ? [{ id: sortField, desc: searchParams[`${sortField}Asc`] === '0' }]
    : null;
  const deleted = searchParams.deleted === '1' ?? false;
  const { notes, pageCount, noteCount } = await getData(
    deckId,
    take,
    keyword ?? '',
    pageIndex,
    sort ?? [],
    deleted
  );

  const deck_profile = await deckCrud.get(deckId);
  return (
    <div className=' container'>
      <Menu />
      <DataTable
        data={notes}
        fsrsParams={generatorParameters(
          JSON.parse(deck_profile.fsrs as string)
        )}
        rowCount={noteCount}
        pageCount={pageCount}
        keyword={keyword}
        sort={sort ?? []}
      />
    </div>
  );
}
