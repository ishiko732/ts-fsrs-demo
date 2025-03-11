interface ISearchNoteProps {
  uid: number
  // TODO
  did?: number

  question?: string
  answer?: string
  deleted?: boolean
  page: Omit<IPagination, 'total'>
  order?: Partial<INoteSortingProps>
}

interface INoteSortingProps {
  question: ISortOrderBy
  cid: ISortOrderBy
  answer: ISortOrderBy
  source: ISortOrderBy
  due: ISortOrderBy
  state: ISortOrderBy
  reps: ISortOrderBy
  stability: ISortOrderBy
  difficulty: ISortOrderBy
  retrievability: ISortOrderBy
}

interface INoteListData {
  question: string
  answer: string
  source: string
  sourceId: string | undefined
  suspended: boolean
  deleted: boolean
  created: number
  updated: number
  stability: number
  difficulty: number
  reps: number
  last_review?: number
  cid: number
  nid: number
  retrievability: number
}
