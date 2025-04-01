import { getSessionUserIdThrow } from '@server/services/auth/session'
import cardService from '@server/services/decks/cards'
import type { ColumnSort, SortingState } from '@tanstack/react-table'
import { redirect } from 'next/navigation'
import React from 'react'

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

type Params = {
  page: string
  take: string
  keyword: string
  sort: NoteSortField
  [key: string]: string | string[]
  deleted: '1' | '0'
}

type NotePageProps = {
  searchParams: Promise<Params>
}

const buildQuery = async (searchParams: Params) => {
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
      keyword,
      deleted: deleted,
      order: computerOrder(sort ?? []),
    },
    keyword,
    sort: sort ?? [],
  }
}

export default async function Page(props: NotePageProps) {
  const { request, keyword, sort } = await buildQuery(await props.searchParams)
  const { data, pagination } = await cardService.getList(request)
  return (
    <div className=" container">
      <Menu />
      <DataTable data={data} page_info={pagination} keyword={keyword} sort={sort} />
    </div>
  )
}
