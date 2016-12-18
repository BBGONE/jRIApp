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
    enque: (func: () => void) => number;
}

interface ITask {
    taskId: number,
    func: () => void;
}

export function createQueue(interval: number = 0): IQueue {
    let _rafQueue: ITask[] = [], _rafQueueMap: IIndexer<ITask> = {},
        _timer: number = null, _newTaskId = 1;

    const res: IQueue = {
        cancel: function (taskId: number) {
            const task = _rafQueueMap[taskId];
            if (!!task) {
                //cancel task by setting its func to null!!!
                task.func = null;
            }
        },
        enque: function (func: () => void): number {
            const taskId = _newTaskId;
            _newTaskId += 1;
            const task: ITask = { taskId: taskId, func: func }, len = _rafQueue.push(task);
            _rafQueueMap[taskId] = task;

            if (!_timer) {
                _timer = win.setTimeout(() => {
                    const arr = _rafQueue;
                    _timer = null;
                    _rafQueue = [];
                    //recycle generated nums if they are too big
                    if (_newTaskId > MAX_NUM)
                        _newTaskId = 1;

                    try {
                        arr.forEach((task) => {
                            try {
                                if (!!task.func) {
                                    task.func();
                                }
                            }
                            catch (err) {
                                error.handleError(win, err, win);
                            }
                        });
                    }
                    finally {
                        //reset the map after all the tasks in the queue have been executed
                        //so a task can be cancelled from another task
                        _rafQueueMap = {};
                        //add tasks which were queued while tasks were executing (from inside the tasks) to the map
                        for (let i = 0; i < _rafQueue.length; i += 1) {
                            _rafQueueMap[_rafQueue[i].taskId] = _rafQueue[i];
                        };
                    }
                }, interval);
            }

            return taskId;
        }
    };

    return res;
}