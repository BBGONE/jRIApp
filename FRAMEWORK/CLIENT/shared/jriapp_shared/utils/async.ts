/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IThenable, ITaskQueue, IStatefulDeferred, IStatefulPromise, PromiseState
} from "./ideferred";
import {
    createDefer, createSyncDefer, whenAll, getTaskQueue
} from "./deferred";
import { Checks } from "./checks";

const checks = Checks;

export class AsyncUtils {
    static createDeferred<T>(): IStatefulDeferred<T> {
        return createDefer<T>();
    }
    //immediate resolve and reject without setTimeout
    static createSyncDeferred<T>(): IStatefulDeferred<T> {
        return createSyncDefer<T>();
    }
    static whenAll<T>(args: Array<T | IThenable<T>>): IStatefulPromise<T[]> {
        return whenAll(args);
    }
    static getTaskQueue(): ITaskQueue {
        return getTaskQueue();
    }
    static delay<T>(func: () => T, time?: number): IStatefulPromise<T> {
        const deferred = createDefer<T>();
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
    static parseJSON(res: string | any): IStatefulPromise<any> {
        return AsyncUtils.delay(() => {
            let parsed: any = null;
            if (checks.isString(res))
                parsed = JSON.parse(res);
            else
                parsed = res;

            return parsed;
        });
    }
}