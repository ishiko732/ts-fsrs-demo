interface PageList<T> {
  data: T[]
  pagination: IPagination
}

interface IPagination {
  page: number
  pageSize: number
  total: number
}

type ISortOrderBy = 'asc' | 'desc'
