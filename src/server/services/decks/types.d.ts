export interface PageList<T> {
  data: T[]
  pagination: {
    page: number
    total: number
  }
}
