import init, {
  Fsrs,
  Progress,
  InitOutput,
  initThreadPool,
} from "fsrs-browser/fsrs_browser";
import * as papa from "papaparse";

Error.stackTraceLimit = 30;

let container: InitOutput | null = null;
let progress: Progress | null = null;

self.onmessage = async (event) => {
  const wasmURL = new URL("@public/fsrs_browser_bg.wasm", import.meta.url);
  let result: TrainResult | Float32Array;
  const { file, offset, cids, eases, ids, types } = event.data;
  if (file instanceof File) {
    result = await loadCsvAndTrain(wasmURL, file, offset);
  } else if (
    cids instanceof BigInt64Array &&
    eases instanceof Uint8Array &&
    ids instanceof BigInt64Array &&
    types instanceof Uint8Array
  ) {
    result = await computeParameters(wasmURL, offset, cids, eases, ids, types);
  } else {
    throw new Error("Invalid data");
  }
  self.postMessage(result);
  console.log("finished");
};

export async function loadCsvAndTrain(
  wasmURL: URL,
  file: papa.LocalFile,
  minute_offset: number
) {
  const cids: bigint[] = [];
  const eases: number[] = [];
  const ids: bigint[] = [];
  const types: number[] = [];

  return new Promise<TrainResult>((resolve, reject) => {
    const startTime = performance.now();
    papa.parse<ParseData>(file, {
      header: true,
      delimiter: ",",
      step: function ({ data }) {
        if (data.card_id === undefined) return;
        cids.push(BigInt(data.card_id));
        ids.push(BigInt(data.review_time));
        eases.push(Number(data.review_rating));
        types.push(Number(data.review_state));
      },
      complete: async function () {
        const loadEndTime = performance.now();
        const trainStartTime = performance.now();
        const w = await computeParameters(
          wasmURL,
          minute_offset,
          new BigInt64Array(cids),
          new Uint8Array(eases),
          new BigInt64Array(ids),
          new Uint8Array(types)
        );
        const endTime = performance.now();
        resolve({
          w,
          loadTime: `${(loadEndTime - startTime).toFixed(5)}ms`,
          trainTime: `${(endTime - trainStartTime).toFixed(5)}ms`,
          totalTime: `${(endTime - startTime).toFixed(5)}ms`,
          count: cids.length,
        });
      },
      error: function (e: Error) {
        reject(e);
      },
    });
  });
}

export async function computeParameters(
  wasmURL: URL,
  minute_offset: number,
  cids: BigInt64Array,
  eases: Uint8Array,
  ids: BigInt64Array,
  types: Uint8Array
) {
  // https://github.com/open-spaced-repetition/fsrs-browser/blob/b44d5ab7d0b44a7cad8b0a61a68440fdfd7e9496/sandbox/src/train.ts#L11-L12
  // PR#10: https://github.com/open-spaced-repetition/fsrs-browser/pull/10#issuecomment-1973066639
  if (!container) { //
    container = await init(wasmURL);
    await initThreadPool(navigator.hardwareConcurrency);
  }

  progress = Progress.new();

  const fsrs = new Fsrs();
  console.time("full training time");
  // must set next.config.js
  // https://vercel.com/docs/projects/project-configuration#headers
  // https://vercel.com/guides/fix-shared-array-buffer-not-defined-nextjs-react
  self.postMessage({
    tag: "start",
    wasmMemoryBuffer: container!.memory.buffer,
    pointer: progress.pointer(),
  } satisfies ProgressStart);
  const parameters = fsrs.computeParametersAnki(
    minute_offset,
    cids,
    eases,
    ids,
    types,
    progress
  );
  self.postMessage({
    tag: "finish",
    parameters,
  } satisfies ProgressFinish);
  fsrs.free();
  progress = null;
  // container = null;
  console.timeEnd("full training time");
  console.log(parameters);
  return parameters;
}

export function getProcessW(w: Float32Array) {
  const processed_w = [];
  for (let i = 0; i < w.length; i++) {
    processed_w.push(Number(w[i].toFixed(8)));
  }
  return processed_w;
}

// not working
// export function getProgressPoint() {
//   if (progress === null || container === null) {
//     return undefined;
//   }
//   const { itemsProcessed, itemsTotal } = getProgress(
//     container.memory.buffer,
//     progress.pointer()
//   );
//   return { itemsProcessed, itemsTotal };
// }
