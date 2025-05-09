interface ISearchNoteProps {
  uid: number
  // TODO
  did?: number


  keyword?: string
  deleted?: boolean
  page: Omit<IPagination, 'total'>
  order?: Partial<INoteSortingProps>
}

interface INoteSortingProps {
  question: ISortOrderBy
  cid: ISortOrderBy
  nid: ISortOrderBy
  answer: ISortOrderBy
  source: ISortOrderBy
  due: ISortOrderBy
  state: ISortOrderBy
  reps: ISortOrderBy
  stability: ISortOrderBy
  difficulty: ISortOrderBy
  retrievability: ISortOrderBy
}

interface ICardListData {
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

interface INoteListData {
  nid: number
  question: string
  answer: string
  source: string
  sourceId: string | undefined
  deleted: boolean
  created: number
  updated: number
}
