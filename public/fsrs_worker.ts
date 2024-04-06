import init, { Fsrs, initThreadPool } from "fsrs-browser/fsrs_browser";
import * as papa from "papaparse";
import { cpus } from "os";

Error.stackTraceLimit = 30;

self.onmessage = async (event) => {
  const wasmURL = new URL("@/../public/fsrs_browser_bg.wasm", import.meta.url);
  if (event.data instanceof File) {
    const result = await loadCsvAndTrain(wasmURL, event.data);
    self.postMessage(result);
  } else if (
    event.data.cids instanceof BigInt64Array &&
    event.data.eases instanceof Uint8Array &&
    event.data.ids instanceof BigInt64Array &&
    event.data.types instanceof Uint8Array
  ) {
    const result = await computeParameters(
      wasmURL,
      event.data.cids,
      event.data.eases,
      event.data.ids,
      event.data.types
    );
    self.postMessage(result);
  }
  console.log("finished");
};

export async function loadCsvAndTrain(wasmURL: URL, file: papa.LocalFile) {
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
  cids: BigInt64Array,
  eases: Uint8Array,
  ids: BigInt64Array,
  types: Uint8Array
) {
  await init(wasmURL);
  console.log(cpus().length);
//   if (cpus.length > 0) {
//     await initThreadPool(cpus().length);
//   }else{
//     await initThreadPool(1);
//   }
  let fsrs = new Fsrs();
  console.time("full training time");
  let parameters = fsrs.computeParametersAnki(cids, eases, ids, types);
  console.timeEnd("full training time");
  fsrs.free();
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
