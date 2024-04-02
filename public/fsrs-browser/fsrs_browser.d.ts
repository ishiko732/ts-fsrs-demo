/* tslint:disable */
/* eslint-disable */
/**
*/
export function start(): void;
/**
* @param {number} num_threads
* @returns {Promise<any>}
*/
export function initThreadPool(num_threads: number): Promise<any>;
/**
* @param {number} receiver
*/
export function wbg_rayon_start_worker(receiver: number): void;
/**
*/
export class Fsrs {
  free(): void;
/**
* @param {Float32Array | undefined} [parameters]
*/
  constructor(parameters?: Float32Array);
/**
* @param {BigInt64Array} cids
* @param {Uint8Array} eases
* @param {BigInt64Array} ids
* @param {Uint8Array} types
* @returns {Float32Array}
*/
  computeParametersAnki(cids: BigInt64Array, eases: Uint8Array, ids: BigInt64Array, types: Uint8Array): Float32Array;
/**
* @param {Uint32Array} ratings
* @param {Uint32Array} delta_ts
* @param {Uint32Array} lengths
* @returns {Float32Array}
*/
  computeParameters(ratings: Uint32Array, delta_ts: Uint32Array, lengths: Uint32Array): Float32Array;
/**
* Returns an array of 2 elements: `[stability, difficulty]`
* @param {Uint32Array} ratings
* @param {Uint32Array} delta_ts
* @returns {Float32Array}
*/
  memoryState(ratings: Uint32Array, delta_ts: Uint32Array): Float32Array;
/**
* Returns an array of 2 elements: `[stability, difficulty]`
* @param {BigInt64Array} cids
* @param {Uint8Array} eases
* @param {BigInt64Array} ids
* @param {Uint8Array} types
* @returns {Float32Array | undefined}
*/
  memoryStateAnki(cids: BigInt64Array, eases: Uint8Array, ids: BigInt64Array, types: Uint8Array): Float32Array | undefined;
/**
* @param {number | undefined} stability
* @param {number} desired_retention
* @param {number} rating
* @returns {number}
*/
  nextInterval(stability: number | undefined, desired_retention: number, rating: number): number;
/**
* @param {number | undefined} stability
* @param {number | undefined} difficulty
* @param {number} desired_retention
* @param {number} days_elapsed
* @returns {NextStates}
*/
  nextStates(stability: number | undefined, difficulty: number | undefined, desired_retention: number, days_elapsed: number): NextStates;
}
/**
*/
export class ItemState {
  free(): void;
/**
*/
  interval: number;
/**
*/
  memory: MemoryState;
}
/**
*/
export class MemoryState {
  free(): void;
/**
*/
  difficulty: number;
/**
*/
  stability: number;
}
/**
*/
export class NextStates {
  free(): void;
/**
*/
  again: ItemState;
/**
*/
  easy: ItemState;
/**
*/
  good: ItemState;
/**
*/
  hard: ItemState;
}
/**
*/
export class wbg_rayon_PoolBuilder {
  free(): void;
/**
* @returns {number}
*/
  numThreads(): number;
/**
* @returns {number}
*/
  receiver(): number;
/**
*/
  build(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly __wbg_fsrs_free: (a: number) => void;
  readonly fsrs_new: (a: number, b: number) => number;
  readonly fsrs_computeParametersAnki: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly fsrs_computeParameters: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
  readonly fsrs_memoryState: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly fsrs_memoryStateAnki: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => void;
  readonly fsrs_nextInterval: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly fsrs_nextStates: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly start: () => void;
  readonly __wbg_memorystate_free: (a: number) => void;
  readonly __wbg_get_memorystate_stability: (a: number) => number;
  readonly __wbg_set_memorystate_stability: (a: number, b: number) => void;
  readonly __wbg_get_memorystate_difficulty: (a: number) => number;
  readonly __wbg_set_memorystate_difficulty: (a: number, b: number) => void;
  readonly __wbg_get_nextstates_again: (a: number) => number;
  readonly __wbg_set_nextstates_again: (a: number, b: number) => void;
  readonly __wbg_get_nextstates_hard: (a: number) => number;
  readonly __wbg_set_nextstates_hard: (a: number, b: number) => void;
  readonly __wbg_get_nextstates_good: (a: number) => number;
  readonly __wbg_set_nextstates_good: (a: number, b: number) => void;
  readonly __wbg_get_nextstates_easy: (a: number) => number;
  readonly __wbg_set_nextstates_easy: (a: number, b: number) => void;
  readonly __wbg_itemstate_free: (a: number) => void;
  readonly __wbg_get_itemstate_memory: (a: number) => number;
  readonly __wbg_set_itemstate_memory: (a: number, b: number) => void;
  readonly __wbg_get_itemstate_interval: (a: number) => number;
  readonly __wbg_set_itemstate_interval: (a: number, b: number) => void;
  readonly __wbg_wbg_rayon_poolbuilder_free: (a: number) => void;
  readonly wbg_rayon_poolbuilder_numThreads: (a: number) => number;
  readonly wbg_rayon_poolbuilder_receiver: (a: number) => number;
  readonly wbg_rayon_poolbuilder_build: (a: number) => void;
  readonly initThreadPool: (a: number) => number;
  readonly wbg_rayon_start_worker: (a: number) => void;
  readonly __wbg_nextstates_free: (a: number) => void;
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_thread_destroy: (a?: number, b?: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput, maybe_memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>, maybe_memory?: WebAssembly.Memory): Promise<InitOutput>;
