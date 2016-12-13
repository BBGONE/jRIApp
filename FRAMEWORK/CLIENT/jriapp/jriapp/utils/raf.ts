/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
//Implements polyfill for requestAnimationFrame api

import {
    IIndexer, Utils
} from "jriapp_shared";
import { bootstrap } from "../bootstrap";

const utils = Utils, checks = utils.check, coreUtils = utils.core,
    arrHelper = utils.arr, boot = bootstrap;


const win: any = utils.dom.window;

function createRAF(interval: number= 40): {
    CAF: (handle: number) => void;
    RAF: (func: FrameRequestCallback) => number;
} {
    let rafQueue: { handle: number; fn: FrameRequestCallback }[] = [],
        rafQueueIndex: IIndexer<number> = {},
        timer: number = null, _newHandle = 1;

    let res = {
        CAF: function (handle: number) {
            const index = rafQueueIndex[handle];
            if (!checks.isNt(index)) {
                arrHelper.removeIndex(rafQueue, index);
                delete rafQueueIndex[handle];
            }
        },
        RAF: function (func: FrameRequestCallback): number {
            const handle = _newHandle;
            _newHandle += 1;
            const len = rafQueue.push({ handle: handle, fn: func });
            rafQueueIndex[handle] = len - 1;

            if (!timer) {
                timer = win.setTimeout(() => {
                    let tmpQueue = rafQueue, tmpTimer = timer;
                    timer = null;
                    rafQueue = [];
                    rafQueueIndex = {};

                    tmpQueue.forEach((raf) => {
                        try {
                            raf.fn(raf.handle);
                        }
                        catch (err) {
                            bootstrap.handleError(err, bootstrap);
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
            win.webkitCancelAnimationFrame || win.webkitCancelRequestAnimationFrame || win.msCancelAnimationFrame;

        if (!requestAnimationFrame || !cancelAnimationFrame) {
            let _raf = createRAF();

            requestAnimationFrame = _raf.RAF;
            cancelAnimationFrame = _raf.CAF;
        }

        win.requestAnimationFrame = requestAnimationFrame;
        win.cancelAnimationFrame = cancelAnimationFrame;
    }
}