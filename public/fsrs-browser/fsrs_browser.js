import { startWorkers } from './snippets/wasm-bindgen-rayon-3e04391371ad0a8e/src/workerHelpers.js';

let wasm;

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.buffer !== wasm.memory.buffer) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().slice(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.buffer !== wasm.memory.buffer) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

let WASM_VECTOR_LEN = 0;

function passArrayF32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getFloat32Memory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedBigUint64Memory0 = null;

function getBigUint64Memory0() {
    if (cachedBigUint64Memory0 === null || cachedBigUint64Memory0.buffer !== wasm.memory.buffer) {
        cachedBigUint64Memory0 = new BigUint64Array(wasm.memory.buffer);
    }
    return cachedBigUint64Memory0;
}

function passArray64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getBigUint64Memory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.buffer !== wasm.memory.buffer) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.buffer !== wasm.memory.buffer) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32Memory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
*/
export function start() {
    wasm.start();
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
};

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
* @param {number} num_threads
* @returns {Promise<any>}
*/
export function initThreadPool(num_threads) {
    const ret = wasm.initThreadPool(num_threads);
    return takeObject(ret);
}

/**
* @param {number} receiver
*/
export function wbg_rayon_start_worker(receiver) {
    wasm.wbg_rayon_start_worker(receiver);
}

const FsrsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_fsrs_free(ptr >>> 0));
/**
*/
export class Fsrs {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FsrsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_fsrs_free(ptr);
    }
    /**
    * @param {Float32Array | undefined} [parameters]
    */
    constructor(parameters) {
        var ptr0 = isLikeNone(parameters) ? 0 : passArrayF32ToWasm0(parameters, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.fsrs_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {BigInt64Array} cids
    * @param {Uint8Array} eases
    * @param {BigInt64Array} ids
    * @param {Uint8Array} types
    * @returns {Float32Array}
    */
    computeParametersAnki(cids, eases, ids, types) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray64ToWasm0(cids, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(eases, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray64ToWasm0(ids, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(types, wasm.__wbindgen_malloc);
            const len3 = WASM_VECTOR_LEN;
            wasm.fsrs_computeParametersAnki(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v5 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint32Array} ratings
    * @param {Uint32Array} delta_ts
    * @param {Uint32Array} lengths
    * @returns {Float32Array}
    */
    computeParameters(ratings, delta_ts, lengths) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray32ToWasm0(ratings, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray32ToWasm0(delta_ts, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray32ToWasm0(lengths, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            wasm.fsrs_computeParameters(retptr, ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v4 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns an array of 2 elements: `[stability, difficulty]`
    * @param {Uint32Array} ratings
    * @param {Uint32Array} delta_ts
    * @returns {Float32Array}
    */
    memoryState(ratings, delta_ts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray32ToWasm0(ratings, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray32ToWasm0(delta_ts, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.fsrs_memoryState(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v3 = getArrayF32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns an array of 2 elements: `[stability, difficulty]`
    * @param {BigInt64Array} cids
    * @param {Uint8Array} eases
    * @param {BigInt64Array} ids
    * @param {Uint8Array} types
    * @returns {Float32Array | undefined}
    */
    memoryStateAnki(cids, eases, ids, types) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passArray64ToWasm0(cids, wasm.__wbindgen_malloc);
            var len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(eases, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray64ToWasm0(ids, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(types, wasm.__wbindgen_malloc);
            const len3 = WASM_VECTOR_LEN;
            wasm.fsrs_memoryStateAnki(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(cids), ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v5;
            if (r0 !== 0) {
                v5 = getArrayF32FromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 4, 4);
            }
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number | undefined} stability
    * @param {number} desired_retention
    * @param {number} rating
    * @returns {number}
    */
    nextInterval(stability, desired_retention, rating) {
        const ret = wasm.fsrs_nextInterval(this.__wbg_ptr, !isLikeNone(stability), isLikeNone(stability) ? 0 : stability, desired_retention, rating);
        return ret >>> 0;
    }
    /**
    * @param {number | undefined} stability
    * @param {number | undefined} difficulty
    * @param {number} desired_retention
    * @param {number} days_elapsed
    * @returns {NextStates}
    */
    nextStates(stability, difficulty, desired_retention, days_elapsed) {
        const ret = wasm.fsrs_nextStates(this.__wbg_ptr, !isLikeNone(stability), isLikeNone(stability) ? 0 : stability, !isLikeNone(difficulty), isLikeNone(difficulty) ? 0 : difficulty, desired_retention, days_elapsed);
        return NextStates.__wrap(ret);
    }
}

const ItemStateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_itemstate_free(ptr >>> 0));
/**
*/
export class ItemState {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ItemState.prototype);
        obj.__wbg_ptr = ptr;
        ItemStateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ItemStateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_itemstate_free(ptr);
    }
    /**
    * @returns {MemoryState}
    */
    get memory() {
        const ret = wasm.__wbg_get_itemstate_memory(this.__wbg_ptr);
        return MemoryState.__wrap(ret);
    }
    /**
    * @param {MemoryState} arg0
    */
    set memory(arg0) {
        _assertClass(arg0, MemoryState);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_itemstate_memory(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {number}
    */
    get interval() {
        const ret = wasm.__wbg_get_itemstate_interval(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set interval(arg0) {
        wasm.__wbg_set_itemstate_interval(this.__wbg_ptr, arg0);
    }
}

const MemoryStateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_memorystate_free(ptr >>> 0));
/**
*/
export class MemoryState {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(MemoryState.prototype);
        obj.__wbg_ptr = ptr;
        MemoryStateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MemoryStateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_memorystate_free(ptr);
    }
    /**
    * @returns {number}
    */
    get stability() {
        const ret = wasm.__wbg_get_memorystate_stability(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set stability(arg0) {
        wasm.__wbg_set_memorystate_stability(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get difficulty() {
        const ret = wasm.__wbg_get_memorystate_difficulty(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set difficulty(arg0) {
        wasm.__wbg_set_memorystate_difficulty(this.__wbg_ptr, arg0);
    }
}

const NextStatesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nextstates_free(ptr >>> 0));
/**
*/
export class NextStates {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NextStates.prototype);
        obj.__wbg_ptr = ptr;
        NextStatesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NextStatesFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nextstates_free(ptr);
    }
    /**
    * @returns {ItemState}
    */
    get again() {
        const ret = wasm.__wbg_get_nextstates_again(this.__wbg_ptr);
        return ItemState.__wrap(ret);
    }
    /**
    * @param {ItemState} arg0
    */
    set again(arg0) {
        _assertClass(arg0, ItemState);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_nextstates_again(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ItemState}
    */
    get hard() {
        const ret = wasm.__wbg_get_nextstates_hard(this.__wbg_ptr);
        return ItemState.__wrap(ret);
    }
    /**
    * @param {ItemState} arg0
    */
    set hard(arg0) {
        _assertClass(arg0, ItemState);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_nextstates_hard(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ItemState}
    */
    get good() {
        const ret = wasm.__wbg_get_nextstates_good(this.__wbg_ptr);
        return ItemState.__wrap(ret);
    }
    /**
    * @param {ItemState} arg0
    */
    set good(arg0) {
        _assertClass(arg0, ItemState);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_nextstates_good(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ItemState}
    */
    get easy() {
        const ret = wasm.__wbg_get_nextstates_easy(this.__wbg_ptr);
        return ItemState.__wrap(ret);
    }
    /**
    * @param {ItemState} arg0
    */
    set easy(arg0) {
        _assertClass(arg0, ItemState);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_nextstates_easy(this.__wbg_ptr, ptr0);
    }
}

const wbg_rayon_PoolBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wbg_rayon_poolbuilder_free(ptr >>> 0));
/**
*/
export class wbg_rayon_PoolBuilder {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(wbg_rayon_PoolBuilder.prototype);
        obj.__wbg_ptr = ptr;
        wbg_rayon_PoolBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        wbg_rayon_PoolBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wbg_rayon_poolbuilder_free(ptr);
    }
    /**
    * @returns {number}
    */
    numThreads() {
        const ret = wasm.wbg_rayon_poolbuilder_numThreads(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    receiver() {
        const ret = wasm.wbg_rayon_poolbuilder_receiver(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    */
    build() {
        wasm.wbg_rayon_poolbuilder_build(this.__wbg_ptr);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_copy_to_typed_array = function(arg0, arg1, arg2) {
        new Uint8Array(getObject(arg2).buffer, getObject(arg2).byteOffset, getObject(arg2).byteLength).set(getArrayU8FromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_d05b68a3572bb8ca = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_process_b02b3570280d0366 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c1cb42213cedf0f5 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_43b1089f407e4ec2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_msCrypto_10fc94afee92bd76 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_0d03cef43b68a530 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_9a7e0f667ead4995 = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_call_67f2111acd2dfdb6 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_self_05040bd9523805b9 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_adc720039f2cb14f = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_622105db80c1457d = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_f56b013ed9bcf359 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_cfecb3965268594c = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_3f093dd26d5569f8 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_b914fb8b50ebbc3e = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_0de9ee56e9f6ee6e = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_b70ccbdf4926a99d = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_subarray_adc418253d76e2f1 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_7e42b4fb8779dc6d = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_new_b1f2d6842d615181 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_7d988c98e6ced92d = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_instanceof_Window_9029196b662bc42a = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_module = function() {
        const ret = __wbg_init.__wbindgen_wasm_module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_startWorkers_2ee336a9694dda13 = function(arg0, arg1, arg2) {
        const ret = startWorkers(takeObject(arg0), takeObject(arg1), wbg_rayon_PoolBuilder.__wrap(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_debug_9a6b3243fbbebb61 = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_788ae33f81d3b84b = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_2e30e8204b29d91d = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_1d3ae0273d8f4f8a = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_d60e832f9882c1b2 = function(arg0) {
        console.warn(getObject(arg0));
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {
    imports.wbg.memory = maybe_memory || new WebAssembly.Memory({initial:18,maximum:16384,shared:true});
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedBigUint64Memory0 = null;
    cachedFloat32Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module, maybe_memory) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports, maybe_memory);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input, maybe_memory) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('fsrs_browser_bg.wasm', "http://localhost:3000/");
        console.log(input.url)
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports, maybe_memory);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
