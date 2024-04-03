import init, { Fsrs } from "fsrs-browser/fsrs_browser";
import * as papa from "papaparse";
// import { cpus } from "os";

Error.stackTraceLimit = 30;

// self.onmessage = async (event) => {
//   const file = event.data;
//   const result = await loadCsvAndTrain(file);
//   self.postMessage(result);
// };

export async function loadCsvAndTrain(file: papa.LocalFile) {
  const cids: bigint[] = [];
  const eases: number[] = [];
  const ids: bigint[] = [];
  const types: number[] = [];
  await init();
//   await initThreadPool(cpus().length);

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
      complete: function () {
        const loadEndTime = performance.now();
        const trainStartTime = performance.now();
        const w = computeParameters(
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

function computeParameters(
  cids: BigInt64Array,
  eases: Uint8Array,
  ids: BigInt64Array,
  types: Uint8Array
) {
  let fsrs = new Fsrs();
  console.time("full training time");
  let parameters = fsrs.computeParametersAnki(cids, eases, ids, types);
  console.timeEnd("full training time");
  fsrs.free();
  console.log(parameters)
  return parameters;
}
