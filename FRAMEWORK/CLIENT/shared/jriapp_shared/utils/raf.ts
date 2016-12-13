/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
//Implements polyfill for requestAnimationFrame API
import { IIndexer } from "../int";
import { Checks } from "./checks";
import { ArrayHelper } from "./arrhelper";
import { DomUtils } from "./dom";
import { ERROR } from "./error";

const checks = Checks, arrHelper = ArrayHelper, error = ERROR, win: any = DomUtils.window;
const MAX_NUM = 99999900000;

export function createRAF(interval: number= 40): {
    cancelRequest: (handle: number) => void;
    queueRequest: (func: FrameRequestCallback) => number;
} {
    let _rafQueue: { handle: number; fn: FrameRequestCallback }[] = [],
        _rafQueueIndex: IIndexer<number> = {},
        _timer: number = null, _newHandle = 1;

    const res = {
        cancelRequest: function (handle: number) {
            const index = _rafQueueIndex[handle];
            if (!checks.isNt(index)) {
                arrHelper.removeIndex(_rafQueue, index);
                delete _rafQueueIndex[handle];
            }
        },
        queueRequest: function (func: FrameRequestCallback): number {
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
                    //recycle generated nums
                    if (_newHandle > MAX_NUM)
                        _newHandle = 1;

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

            requestAnimationFrame = _raf.queueRequest;
            cancelAnimationFrame = _raf.cancelRequest;
        }

        win.requestAnimationFrame = requestAnimationFrame;
        win.cancelAnimationFrame = cancelAnimationFrame;
    }
}