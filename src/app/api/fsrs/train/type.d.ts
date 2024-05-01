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

interface ProgressStart {
  tag: "start";
  wasmMemoryBuffer: ArrayBuffer;
  pointer: number;
}

interface ProgressFinish {
  tag: "finish";
  parameters: Float32Array;
}

interface ProgressItem {
  itemsProcessed: number;
  itemsTotal: number;
}

interface Progress extends ProgressItem {
  tag: "progress";
}

type ProgressState = Progress | ProgressStart | ProgressFinish;
