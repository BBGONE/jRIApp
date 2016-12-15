/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IIndexer } from "../int";
import { Checks } from "./checks";
import { ArrayHelper } from "./arrhelper";
import { ERROR } from "./error";

const checks = Checks, arrHelper = ArrayHelper, error = ERROR;
const MAX_NUM = 99999900000, win = window;

export interface IQueue
{
    cancel: (taskId: number) => void;
    enque: (func: FrameRequestCallback) => number;
}

export function createQueue(interval: number = 0): IQueue {
    let _rafQueue: {
        taskId: number;
        func: FrameRequestCallback
    }[] = [], _rafQueueIndex: IIndexer<number> = {},
        _timer: number = null, _newTaskId = 1;

    const res: IQueue = {
        cancel: function (taskId: number) {
            const index = _rafQueueIndex[taskId];
            if (!checks.isNt(index)) {
                arrHelper.removeIndex(_rafQueue, index);
                delete _rafQueueIndex[taskId];
            }
        },
        enque: function (func: FrameRequestCallback): number {
            const taskId = _newTaskId;
            _newTaskId += 1;
            const len = _rafQueue.push({ taskId: taskId, func: func });
            _rafQueueIndex[taskId] = len - 1;

            if (!_timer) {
                _timer = win.setTimeout(() => {
                    const arr = _rafQueue;
                    _timer = null;
                    _rafQueue = [];
                    _rafQueueIndex = {};
                    //recycle generated nums
                    if (_newTaskId > MAX_NUM)
                        _newTaskId = 1;

                    arr.forEach((task) => {
                        try {
                            task.func(task.taskId);
                        }
                        catch (err) {
                            error.handleError(win, err, win);
                        }
                    });
                }, interval);
            }

            return taskId;
        }
    };

    return res;
}