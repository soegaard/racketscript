// Continuation Marks
import * as Pair from "./pair.js"
import * as $ from "./lib.js";

let __frames = false;
let __async_callback_wrappers = [];
let HASH = $.hashEq;

/* --------------------------------------------------------------------------*/

export function init() {
    __frames = Pair.Empty;
    enterFrame();
}

export function registerAsynCallbackWrapper(cb) {
    __async_callback_wrappers.push(cb);
}

init();

/* --------------------------------------------------------------------------*/

export function getFrames() {
    return __frames;
}

export function updateFrame(newFrames, oldFrames) {
    if (__frames !== oldFrames) {
	throw new Error("current frame doesn't match with old frame");
    }
    return __frames = newFrames;
}

export function enterFrame() {
    __frames = Pair.make({}, __frames);
    return __frames;
}

export function setMark(key, value) {
    let frame = __frames.hd;
    frame[HASH(key)] = value;
}

export function getContinuationMarks() {
    return __frames;
}

export function getMarks(frames, key) {
    let result = [];
    let keyHash = HASH(key);
    Pair.listForEach(frames, (fr) => {
	if (keyHash in fr) {
	    result.push(fr[keyHash]);
	}
    });
    return Pair.listFromArray(result);
}

export function getFirstMark(frames, key, noneV) {
    let keyHash = HASH(key);
    return Pair.listFind(frames, (fr) => {
	if (keyHash in fr) {
	    return fr[keyHash];
	}
    }) || noneV;
}

export function wrapWithContext(fn) {
    return (function (currentFrames) {
	return function (...args) {
	    init();
	    __async_callback_wrappers.forEach((cb) => cb(currentFrames));
	    try {
		return fn.apply(null, args);
	    } finally {
		/* This callback/coroutine is finished */
		__frames = undefined;
	    }
	}
    })(__frames);
}
