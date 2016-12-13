/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
//Implements polyfill for requestAnimationFrame API
import { IIndexer } from "../int";
import { Utils } from "./utils";
import { ERROR } from "./error";

const utils = Utils, checks = utils.check, coreUtils = utils.core,
    arrHelper = utils.arr, error = ERROR;


const win: any = utils.dom.window;

export function createRAF(interval: number= 40): {
    CAF: (handle: number) => void;
    RAF: (func: FrameRequestCallback) => number;
} {
    let _rafQueue: { handle: number; fn: FrameRequestCallback }[] = [],
        _rafQueueIndex: IIndexer<number> = {},
        _timer: number = null, _newHandle = 1;

    const res = {
        CAF: function (handle: number) {
            const index = _rafQueueIndex[handle];
            if (!checks.isNt(index)) {
                arrHelper.removeIndex(_rafQueue, index);
                delete _rafQueueIndex[handle];
            }
        },
        RAF: function (func: FrameRequestCallback): number {
            const handle = _newHandle;
            _newHandle += 1;
            const len = _rafQueue.push({ handle: handle, fn: func });
            _rafQueueIndex[handle] = len - 1;

            if (!_timer) {
                _timer = win.setTimeout(() => {
                    const arr = _rafQueue;
                    _timer = null;
                    _rafQueue = [];
                    _rafQueueIndex = {};

                    arr.forEach((raf) => {
                        try {
                            raf.fn(raf.handle);
                        }
                        catch (err) {
                            error.handleError(win, err, win);
                        }
                    });
                }, interval);
            }

            return handle;
        }
    };

    return res;
}

export function checkRAF() {
    if (!win.requestAnimationFrame) {
        let requestAnimationFrame = win.requestAnimationFrame || win.mozRequestAnimationFrame ||
            win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;

        let cancelAnimationFrame = win.cancelAnimationFrame || win.mozCancelAnimationFrame ||
            (win.webkitCancelAnimationFrame || win.webkitCancelRequestAnimationFrame) ||
            win.msCancelAnimationFrame;

        if (!requestAnimationFrame || !cancelAnimationFrame) {
            const _raf = createRAF();

            requestAnimationFrame = _raf.RAF;
            cancelAnimationFrame = _raf.CAF;
        }

        win.requestAnimationFrame = requestAnimationFrame;
        win.cancelAnimationFrame = cancelAnimationFrame;
    }
}