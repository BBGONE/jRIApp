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

interface ITask {
    taskId: number,
    func: FrameRequestCallback;
}

export function createQueue(interval: number = 0): IQueue {
    let _rafQueue: {
        taskId: number;
        func: FrameRequestCallback
    }[] = [], _rafQueueIndex: IIndexer<ITask> = {},
        _timer: number = null, _newTaskId = 1;

    const res: IQueue = {
        cancel: function (taskId: number) {
            const task = _rafQueueIndex[taskId];
            if (!checks.isNt(task)) {
                //cancel task by setting its func to null!!!
                task.func = null;
            }
        },
        enque: function (func: FrameRequestCallback): number {
            const taskId = _newTaskId;
            _newTaskId += 1;
            const task: ITask = { taskId: taskId, func: func }, len = _rafQueue.push(task);
            _rafQueueIndex[taskId] = task;

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
                            if (!!task.func) {
                                task.func(task.taskId);
                            }
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