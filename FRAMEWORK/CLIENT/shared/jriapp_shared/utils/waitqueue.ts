/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IBaseObject } from "../int";
import { BaseObject }  from "../object";
import { CoreUtils } from "./coreutils";

const { getNewID, Indexer, extend } = CoreUtils;

export interface IWaitQueueItem {
    prop: string;
    groupName?: string;
    predicate: (val: any) => boolean;
    action: (...args: any[]) => void;
    actionArgs?: any[];
    lastWins?: boolean;
}

interface IWaitQueueTask {
    predicate: (val: any) => boolean;
    action: (...args: any[]) => any;
    group: string;
    lastWins: boolean;
    args: any[];
}

/*
   waits for property change on the object (the owner)
   then checks queue of actions for the property change
   based on property value checking predicate
   if the predicate returns true, invokes the task's action
*/
export class WaitQueue extends BaseObject {
    private _uniqueID: string;
    private _owner: IBaseObject;
    private _queue: { [property: string]: IWaitQueueTask[] };
    constructor(owner: IBaseObject) {
        super();
        this._uniqueID = getNewID("wq");
        this._owner = owner;
        this._queue = Indexer();
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._owner.objEvents.offNS(this.uniqueID);
        this._queue = Indexer();
        this._owner = null;
        super.dispose();
    }
    protected _checkQueue(prop: string, value: any): void {
        if (!this._owner || this._owner.getIsStateDirty()) {
            return;
        }
        const self = this, propQueue = this._queue[prop];
        let task: IWaitQueueTask;
        if (!propQueue || propQueue.length === 0) {
            return;
        }

        let i: number, firstWinsTask: IWaitQueueTask = null;
        const groups: {
                group: string;
                tasks: IWaitQueueTask[]
            } = { group: <string>null, tasks: <IWaitQueueTask[]>[] },
            found: IWaitQueueTask[] = [], forRemoval: IWaitQueueTask[] = [];

        for (i = 0; i < propQueue.length; i += 1) {
            task = propQueue[i];
            if (task.predicate(value)) {
                if (!task.group && groups.tasks.length === 0) {
                    firstWinsTask = task;
                    break;
                } else if (!!task.group) { // the task in the group of tasks
                    if (!groups.group) {
                        groups.group = task.group;
                    }
                    if (groups.group === task.group) {
                        groups.tasks.push(task); // if the task in the same group, add it to the array
                    }
                }
            }
        }

        // the first task will be executed, in normal queued order, the rest tasks are waiting
        if (!!firstWinsTask) {
            found.push(firstWinsTask);
            forRemoval.push(firstWinsTask);
        } else {
            while (groups.tasks.length > 0) {
                task = groups.tasks.pop();
                if (!firstWinsTask) {
                    firstWinsTask = task;
                }

                if (firstWinsTask.lastWins) { // the last task wins, the rest is ignored
                    if (found.length === 0) {
                        found.push(task); // add only the last task, the rest just remove from queue
                    }
                } else {
                    found.push(task); // add all tasks in the group, they will be executed all
                }
                forRemoval.push(task);
            }
        }

        try {
            if (found.length > 0) {
                i = propQueue.length;
                while (i > 0) {
                    i -= 1;
                    if (forRemoval.indexOf(propQueue[i]) > -1) {
                        propQueue.splice(i, 1);
                    }
                }

                for (const task of found)
                {
                    try {
                        task.action.apply(self._owner, task.args);
                    } catch (ex) {
                        self._owner.handleError(ex, self);
                    }
                }
            }
        } finally {
            if (propQueue.length === 0) {
                delete this._queue[prop];
                this._owner.objEvents.offProp(prop, this.uniqueID);
            }
        }
    }
    enQueue(item: IWaitQueueItem): void {
        const opts: IWaitQueueItem = extend({
            prop: "",
            groupName: null,
            predicate: null,
            action: null,
            actionArgs: [],
            lastWins: false
        }, item);
        const self = this;
        if (!this._owner) {
            return;
        }
        const property = opts.prop;
        let propQueue = this._queue[property];

        if (!propQueue) {
            propQueue = [];
            this._queue[property] = propQueue;
            this._owner.objEvents.onProp(property, function () {
                setTimeout(function () {
                    if (self.getIsStateDirty()) {
                        return;
                    }
                    self._checkQueue(property, (<any>self._owner)[property]);
                }, 0);
            }, self.uniqueID);
        }

        const task: IWaitQueueTask = {
            predicate: opts.predicate,
            action: opts.action,
            group: opts.groupName,
            lastWins: opts.lastWins,
            args: (!opts.actionArgs ? [] : opts.actionArgs)
        };
        propQueue.push(task);
        self._checkQueue(property, (<any>self._owner)[property]);
        setTimeout(function () {
            if (self.getIsStateDirty()) {
                return;
            }
            self._checkQueue(property, (<any>self._owner)[property]);
        }, 0);
    }
    toString(): string {
        return "WaitQueue " + this._uniqueID;
    }
    get uniqueID(): string {
        return this._uniqueID;
    }
    get owner(): IBaseObject {
        return this._owner;
    }
}
