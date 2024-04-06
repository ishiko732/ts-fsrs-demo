interface ParseData {
  review_time: string;
  card_id: string;
  review_rating: string;
  review_duration: string;
  review_state: string;
}

interface TrainResult {
  w: Float32Array;
  loadTime: string;
  trainTime: string;
  totalTime: string;
  count: number;
}