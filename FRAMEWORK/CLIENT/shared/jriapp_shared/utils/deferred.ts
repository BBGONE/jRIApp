/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IStatefulDeferred, IStatefulPromise, ITaskQueue, PromiseState,
    IThenable, IPromise, IAbortablePromise, IAbortable
} from "./ideferred";
import { AbortError } from "../errors";
import { Checks } from "./checks";
import { ArrayHelper } from "./arrhelper";
import { createQueue, IQueue } from "./queue";
import { TFunc } from "../int";

const { _undefined, isFunc, isThenable, isArray } = Checks, arrHelper = ArrayHelper;
let taskQueue: TaskQueue = null;

export function createDefer<T>(isSync?: boolean): IStatefulDeferred<T> {
    return new Promise<T>(null, (!isSync ? fn_enque : fn_exec)).deferred();
}

export function createSyncDefer<T>(): IStatefulDeferred<T> {
    return createDefer<T>(true);
}

export function getTaskQueue(): ITaskQueue {
    if (!taskQueue) {
        taskQueue = new TaskQueue();
    }
    return taskQueue;
}

export function whenAll<T>(promises: Array<T | IThenable<T>>): IStatefulPromise<T[]> {
    const results: T[] = [], resolved: IThenable<T> = createDefer<T>().resolve(null);
    const merged: any = promises.reduce((acc: IThenable<T>, p: T | IThenable<T>) => acc.then(() => p).then((r: T) => { results.push(r); return r; })
        , resolved);
    return merged.then(() => results);
}

export function race<T>(promises: IThenable<T>[]): IStatefulPromise<T> {
    return new Promise((res, rej) => {
        promises.forEach(p => p.then(res).then(_undefined, rej));
    });
}

/**
 * Sequentially executes functions which return promises
   instead  it returns a promise which have a result - an array of results of the promises
 * @param funcs (array of functions which return promises)
 */
export function promiseSerial<T>(funcs: { (): IThenable<T>; }[]): IStatefulPromise<T[]> {
    return funcs.reduce((promise, func) => promise.then(result => func().then((res) => result.concat(res))),
        Promise.resolve<T[]>([]));
}

export type TDispatcher = (closure: TFunc) => void;

function fn_enque(task: () => void) {
    getTaskQueue().enque(task);
}

function fn_exec(task: () => void) {
    task();
}

class TaskQueue implements ITaskQueue {
    private _queue: IQueue;

    constructor() {
        this._queue = createQueue(0);
    }

    enque(task: () => void): number {
        return this._queue.enque(task);
    }

    cancel(taskId: number): void {
       this._queue.cancel(taskId);
    }
}

class Callback {
    private readonly _dispatcher: TDispatcher;
    private readonly _successCB: any;
    private readonly _errorCB: any;
    private readonly _deferred: IStatefulDeferred<any>;

    constructor(dispatcher: TDispatcher, successCB: any, errorCB: any) {
        this._dispatcher = dispatcher;
        this._successCB = successCB;
        this._errorCB = errorCB;
        this._deferred = new Promise<any>(null, dispatcher).deferred();
    }

    resolve(value: any, defer: boolean): void {
        if (!isFunc(this._successCB)) {
            this._deferred.resolve(value);
            return;
        }

        if (!!defer) {
            this._dispatcher(() => this._dispatch(this._successCB, value));
        } else {
            this._dispatch(this._successCB, value);
        }
    }
    reject(error: any, defer: boolean): void {
        if (!isFunc(this._errorCB)) {
            this._deferred.reject(error);
            return;
        }

        if (!!defer) {
            this._dispatcher(() => this._dispatch(this._errorCB, error));
        } else {
            this._dispatch(this._errorCB, error);
        }
    }
    private _dispatch(callback: (arg: any) => any, arg: any): void {
        try {
            const result = callback(arg);
            this._deferred.resolve(result);
        } catch (err) {
            this._deferred.reject(err);
        }
    }

    get deferred(): IStatefulDeferred<any> {
        return this._deferred;
    }
}

class Deferred<T> implements IStatefulDeferred<T> {
    private readonly _promise: IStatefulPromise<T>;
    private readonly _dispatcher: TDispatcher;
    private _stack: Array<Callback>;
    private _state: PromiseState;
    private _value: T;
    private _error: any;

    constructor(promise: IStatefulPromise<T>, dispatcher: TDispatcher) {
        this._promise = promise;
        this._dispatcher = dispatcher;
        this._value = _undefined;
        this._error = _undefined;
        this._state = PromiseState.Pending;
        this._stack = [];
    }

    private _resolve(value: any): IStatefulDeferred<T> {
        let pending = true;
        try {
            if (isThenable(value)) {
                if (value === this._promise) {
                    throw new TypeError("recursive resolution");
                }
                const fnThen = value.then;
                this._state = PromiseState.ResolutionInProgress;

                fnThen.call(value,
                    (result: any): void => {
                        if (pending) {
                            pending = false;
                            this._resolve(result);
                        }
                    },
                    (error: any): void => {
                        if (pending) {
                            pending = false;
                            this._reject(error);
                        }
                    }
                );
            } else {
                this._state = PromiseState.ResolutionInProgress;

                this._dispatcher(() => {
                    this._state = PromiseState.Resolved;
                    this._value = value;

                    const stackSize = this._stack.length;

                    for (let i = 0; i < stackSize; i++) {
                        this._stack[i].resolve(value, false);
                    }

                    this._stack.splice(0, stackSize);
                });
            }
        } catch (err) {
            if (pending) {
                this._reject(err);
            }
        }

        return this;
    }
    private _reject(error?: any): IStatefulDeferred<T> {
        this._state = PromiseState.ResolutionInProgress;

        this._dispatcher(() => {
            this._state = PromiseState.Rejected;
            this._error = error;

            const stackSize = this._stack.length;
            for (let i = 0; i < stackSize; i++) {
                this._stack[i].reject(error, false);
            }

            this._stack.splice(0, stackSize);
        });

        return this;
    }
    _then(successCB: any, errorCB: any): any {
        if (!isFunc(successCB) && !isFunc(errorCB)) {
            return this._promise;
        }

        const cb = new Callback(this._dispatcher, successCB, errorCB);

        switch (this._state) {
            case PromiseState.Pending:
            case PromiseState.ResolutionInProgress:
                this._stack.push(cb);
                break;

            case PromiseState.Resolved:
                cb.resolve(this._value, true);
                break;

            case PromiseState.Rejected:
                cb.reject(this._error, true);
                break;
        }

        return cb.deferred.promise();
    }

    resolve(value?: T | PromiseLike<T> | IThenable<T> | IPromise<T> | IStatefulPromise<T>): IStatefulPromise<T> {
        if (this._state !== PromiseState.Pending) {
            return this.promise();
        }
        return this._resolve(value).promise();
    }

    reject(error?: any): IStatefulPromise<T> {
        if (this._state !== PromiseState.Pending) {
            return this.promise();
        }
        return this._reject(error).promise();
    }

    promise(): IStatefulPromise<T> {
        return this._promise;
    }

    state(): PromiseState {
        return this._state;
    }
}

export class Promise<T> implements IStatefulPromise<T> {
    private _deferred: Deferred<T>;

    constructor(fn: (resolve: (res?: T) => void, reject: (err?: any) => void) => void, dispatcher?: TDispatcher) {
        const disp = (!dispatcher ? fn_enque : dispatcher), deferred = new Deferred<T>(this, disp);
        this._deferred = deferred;
        if (!!fn) {
            getTaskQueue().enque(() => {
                fn((res?: T) => deferred.resolve(res), (err?: any) => deferred.reject(err));
            });
        }
    }

    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | IThenable<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | IThenable<TResult2>) | undefined | null
    ): IStatefulPromise<TResult1 | TResult2> {
        return this._deferred._then(onFulfilled, onRejected);
    }

    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | IThenable<TResult>) | undefined | null
    ): IStatefulPromise<T | TResult> {
        return this._deferred._then(_undefined, onRejected);
    }

    finally(onFinally: () => void): IStatefulPromise<T> {
        return this._deferred._then((res: any) => {
            onFinally();
            return res;
        }, (err: any) => {
            onFinally();
            return Promise.reject(err);
        });
    }

    static all<T>(...promises: Array<T | IThenable<T>>): IStatefulPromise<T[]>;

    static all<T>(promises: Array<T | IThenable<T>>): IStatefulPromise<T[]>;

    static all<T>(): IStatefulPromise<T[]> {
        const args: any[] = arrHelper.fromList(arguments);
        return (args.length === 1 && isArray(args[0])) ? whenAll(args[0]) : whenAll(args);
    }

    static race<T>(...promises: Array<IPromise<T>>): IPromise<T>;

    static race<T>(promises: Array<IPromise<T>>): IPromise<T>;

    static race<T>(): IPromise<T> {
        const args: any[] = arrHelper.fromList(arguments);
        return (args.length === 1 && isArray(args[0])) ? race(args[0]) : race(args);
    }

    static reject<T>(reason?: any, isSync?: boolean): IStatefulPromise<T> {
        const deferred = createDefer<T>(isSync);
        deferred.reject(reason);
        return deferred.promise();
    }

    static resolve<T>(value?: T | PromiseLike<T> | IThenable<T> | IPromise<T> | IStatefulPromise<T>, isSync?: boolean): IStatefulPromise<T> {
        const deferred = createDefer<T>(isSync);
        deferred.resolve(value);
        return deferred.promise();
    }

    state(): PromiseState {
        return this._deferred.state();
    }

    deferred(): IStatefulDeferred<T> {
        return this._deferred;
    }
}

export class AbortablePromise<T> implements IAbortablePromise<T> {
    private _deferred: IStatefulDeferred<T>;
    private _abortable: IAbortable;
    private _aborted: boolean;

    constructor(deferred: IStatefulDeferred<T>, abortable: IAbortable) {
        this._deferred = deferred;
        this._abortable = abortable;
        this._aborted = false;
    }

    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | IThenable<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | IThenable<TResult2>) | undefined | null
    ): IStatefulPromise<TResult1 | TResult2 > {
        return this._deferred.promise().then(onFulfilled, onRejected);
    }

    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | IThenable<TResult>) | undefined | null
    ): IStatefulPromise<T | TResult> {
        return this._deferred.promise().catch(onRejected);
    }

    finally(onFinally: () => void): IStatefulPromise<T> {
        return this._deferred.promise().finally(onFinally);
    }

    abort(reason?: string): void {
        if (this._aborted) {
            return;
        }
        const self = this;
        self._deferred.reject(new AbortError(reason));
        self._aborted = true;
        setTimeout(() => { self._abortable.abort(); }, 0);
    }

    state(): PromiseState {
        return this._deferred.state();
    }
}
