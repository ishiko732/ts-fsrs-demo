type ExportRevLog = {
  card_id: number
  review_time: number
  review_rating: Rating
  review_state: RevLogState
  review_duration?: number
}

type ExportRevLogs = Array<ExportRevLog>
