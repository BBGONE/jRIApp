/// <reference path="../jriapp_core/../../thirdparty/jquery.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IThenable, ITaskQueue } from "../jriapp_core/shared";
import { IPromise, IDeferred, create as createDefer, createSync as createSyncDefer, whenAll, getTaskQueue } from "./deferred";

export { IPromise, IPromiseState, IAbortablePromise, PromiseState, IDeferred, whenAll, AbortablePromise } from "./deferred";

export class AsyncUtils {
    static createDeferred<T>(): IDeferred<T> {
        return createDefer<T>();
    }
    //immediate resolve and reject without setTimeout
    static createSyncDeferred<T>(): IDeferred<T> {
        return createSyncDefer<T>();
    }
    static whenAll<T>(args: Array<T | IThenable<T>>): IPromise<T[]> {
        return whenAll(args);
    }
    static getTaskQueue(): ITaskQueue {
        return getTaskQueue();
    }
    static delay<T>(func: () => T, time?: number): IPromise<T> {
        let deferred = createDefer<T>();
        setTimeout(() => {
            try {
                deferred.resolve(func());
            }
            catch (err) {
                deferred.reject(err);
            }
        }, !time ? 0 : time);

        return deferred.promise();
    }
}