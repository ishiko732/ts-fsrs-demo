import { getSessionUserIdThrow } from '@server/services/auth/session'
import noteService from '@server/services/decks/notes'
import type { ColumnSort, SortingState } from '@tanstack/react-table'
import { redirect } from 'next/navigation'
import React from 'react'
import { generatorParameters } from 'ts-fsrs'

import { getUserParams } from '@/actions/userParamsService'
import Menu from '@/components/menu'
import DataTable from '@/components/note/data-table'

export const revalidate = 0 // no cache

function computerOrder(orders: SortingState) {
  if (!Array.isArray(orders) || orders.length === 0) {
    orders = [
      {
        id: 'due',
        desc: false,
      } satisfies ColumnSort,
    ]
  }

  const _order = {} as { [key in keyof INoteSortingProps]: ISortOrderBy }
  for (const sort of Array.from(orders)) {
    if (['question', 'answer', 'source', 'due', 'state', 'reps', 'S', 'D', 'R'].includes(sort.id)) {
      if (sort.id === 'S') {
        sort.id = 'stability'
      } else if (sort.id === 'D') {
        sort.id = 'difficulty'
      } else if (sort.id === 'R') {
        sort.id = 'retrievability'
      }
      _order[sort.id as keyof INoteSortingProps] = sort.desc ? 'desc' : 'asc'
    }
  }
  return _order
}

type NoteSortField = 'question' | 'answer' | 'source' | 'D' | 'S' | 'R' | 'Reps'

type NotePageProps = {
  searchParams: {
    page: string
    take: string
    keyword: string
    sort: NoteSortField
    [key: string]: string | string[]
    deleted: '1' | '0'
  }
}

const buildQuery = async (searchParams: NotePageProps['searchParams']) => {
  const take = Number(searchParams['take'])
  const pageIndex = Number(searchParams['page'])
  if (!Number.isInteger(take) || !Number.isInteger(pageIndex) || pageIndex < 1 || take < 1) {
    redirect('/note?page=1&take=15')
  }
  const keyword = searchParams.keyword ?? undefined
  const sortField = searchParams.sort ?? []
  const sort: SortingState | null = Array.isArray(searchParams.sort)
    ? Array.from(sortField).map((s) => {
        return {
          id: s,
          desc: searchParams[`${s}Asc`] === '0',
        }
      })
    : searchParams.sort
      ? [{ id: sortField, desc: searchParams[`${sortField}Asc`] === '0' }]
      : null
  const deleted = searchParams.deleted === '1'
  const uid = await getSessionUserIdThrow().catch(() => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => params.append(key, val))
      } else {
        params.append(key, value)
      }
    })
    redirect(`/api/auth/signin?callbackUrl=/note?${params.toString()}`)
  })
  return {
    request: {
      uid,
      page: { page: pageIndex, pageSize: take },
      question: keyword,
      answer: keyword,
      deleted: deleted,
      order: computerOrder(sort ?? []),
    },
    keyword,
    sort: sort ?? [],
  }
}

export default async function Page({ searchParams }: NotePageProps) {
  const { request, keyword, sort } = await buildQuery(searchParams)
  const { data, pagination } = await noteService.getList(request)
  const params = await getUserParams()
  return (
    <div className=" container">
      <Menu />
      <DataTable data={data} fsrsParams={generatorParameters(params.data?.params)} page_info={pagination} keyword={keyword} sort={sort} />
    </div>
  )
}
