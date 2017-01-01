/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IThenable, ITaskQueue, IStatefulDeferred, IStatefulPromise, PromiseState, IPromise
} from "./ideferred";
import {
    createDefer, whenAll, race, getTaskQueue, Promise
} from "./deferred";
import { Checks } from "./checks";

const checks = Checks, _whenAll = whenAll, _race = race, _getTaskQueue = getTaskQueue, _createDefer = createDefer;

export class AsyncUtils {
    static createDeferred<T>(isSync?: boolean): IStatefulDeferred<T> {
        return _createDefer<T>();
    }
    static reject<T>(reason?: any, isSync?: boolean): IStatefulPromise<T> {
        return Promise.reject(reason, isSync);
    }
    static resolve<T>(value?: T, isSync?: boolean): IStatefulPromise<T> {
        return Promise.resolve(value, isSync);
    }
    static whenAll<T>(args: Array<T | IThenable<T>>): IStatefulPromise<T[]> {
        return _whenAll(args);
    }
    static race<T>(promises: Array<IPromise<T>>): IPromise<T> {
        return _race(promises);
    }
    static getTaskQueue(): ITaskQueue {
        return _getTaskQueue();
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
            return (checks.isString(res)) ? JSON.parse(res) : res;
        });
    }
}