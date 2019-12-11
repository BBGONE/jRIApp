/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    ITaskQueue, IStatefulDeferred, IStatefulPromise, IPromise, IThenable
} from "./ideferred";
import {
    createDefer, whenAll, race, getTaskQueue, Promise, promiseSerial
} from "./deferred";
import { Checks } from "./checks";

const { isString } = Checks, _whenAll = whenAll, _race = race, _getTaskQueue = getTaskQueue, _createDefer = createDefer;

export class AsyncUtils {
    static createDeferred<T>(isSync?: boolean): IStatefulDeferred<T> {
        return _createDefer<T>(isSync);
    }
    static reject<T>(reason?: any, isSync?: boolean): IStatefulPromise<T> {
        return Promise.reject(reason, isSync);
    }
    static resolve<T>(value?: T, isSync?: boolean): IStatefulPromise<T> {
        return Promise.resolve(value, isSync);
    }
    /**
     * execute sequentially
     * @param funcs (array of functions which return promises)
     */
    static promiseSerial<T>(funcs: { (): IPromise<T>; }[]): IStatefulPromise<T[]> {
        return promiseSerial(funcs);
    }
    static whenAll<T>(args: Array<T | IThenable<T>>): IStatefulPromise<T[]> {
        return _whenAll(args);
    }
    static race<T>(promises: Array<IThenable<T>>): IPromise<T> {
        return _race(promises);
    }
    static getTaskQueue(): ITaskQueue {
        return _getTaskQueue();
    }
    static delay<T>(func: () => IPromise<T> | T, time?: number): IStatefulPromise<T>;
    static delay(func: () => any, time?: number): IStatefulPromise<any> {
        const deferred = createDefer<any>(true);
        setTimeout(() => {
            try {
                deferred.resolve(func());
            } catch (err) {
                deferred.reject(err);
            }
        }, !time ? 0 : time);

        return deferred.promise();
    }
    static parseJSON<T>(res: string | any): IStatefulPromise<T>;
    static parseJSON(res: any): IStatefulPromise<any> {
        return AsyncUtils.delay(() => {
            return (isString(res)) ? JSON.parse(res) : res;
        });
    }
}
