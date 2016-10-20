/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as coreMOD from "../jriapp_core/shared";
import { Checks as checks } from "./checks";

export const enum PromiseState { Pending, ResolutionInProgress, Resolved, Rejected }

export interface IPromiseState {
    state(): PromiseState;
}

export interface IPromise<T> extends coreMOD.IPromise<T>, IPromiseState {
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IVoidErrorCB
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IVoidErrorCB
    ): IPromise<TP>;

    always<TP>(errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
    always<TP>(errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
    always(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;

    fail(errorCB?: coreMOD.IDeferredErrorCB<T>): IPromise<T>;
    fail(errorCB?: coreMOD.IErrorCB<T>): IPromise<T>;
    fail(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;
}

export interface IAbortablePromise<T> extends IPromise<T>, coreMOD.IAbortable {
}

export interface IDeferred<T> extends coreMOD.IDeferred<T>, IPromiseState {
    resolve(value?: coreMOD.IThenable<T>): IPromise<T>;
    resolve(value?: T): IPromise<T>;
    reject(error?: any): IPromise<T>;
    promise(): IPromise<T>;
}

export function create<T>(): IDeferred<T> {
    return new Deferred(fn_dispatch);
}

export function createSync<T>(): IDeferred<T> {
    return new Deferred(fn_dispatchImmediate);
}

export function getTaskQueue(): coreMOD.ITaskQueue {
    return taskQueue;
}

export function whenAll<T>(args: Array<T | coreMOD.IThenable<T>>): IPromise<T[]> {
    let deferred = create<T[]>(), errors = <any[]>[], countAll = args.length, result = new Array<T>(args.length);
    let checkResult = function () {
            if (countAll === 0) {
                if (errors.length > 0)
                    deferred.reject(new coreMOD.AggregateError(errors));
                else
                    deferred.resolve(result);
            }
        };
   
    const cnt = args.length;
    if (cnt === 0) {
        deferred.resolve([]);
    }

    for (let i = 0; i < cnt; i += 1) {
        let value = args[i];
        if (checks.isThenable(value)) {
            (<coreMOD.IThenable<T>>value).then((res) => {
                --countAll;
                result[i] = res;
                checkResult();
            }, (err) => {
                --countAll;
                result[i] = err;
                errors.push(err);
                checkResult();
            });
        }
        else {
            --countAll;
            result[i] = value;
            checkResult();
        }
    }

    return deferred.promise();
}

interface IDispatcher {
    (closure: () => void): void;
}

function fn_dispatch(task: () => void) {
    taskQueue.enque(task);
}

function fn_dispatchImmediate(task: () => void) {
    task();
}

class TaskQueue implements coreMOD.ITaskQueue {
    private _tasks: { (): void; }[];
    private _state: number;

    constructor() {
        this._tasks = [];
        this._state = 0;
    }

    private _process(): void {
        let tasks = this._tasks;
        this._tasks = [];
        for (let i = 0; i < tasks.length; i += 1) {
            tasks[i]();
        }
    }

    enque(task: () => void) {
        this._tasks.push(task);

        if (this._state === 0) {
            this._state = 1;
            setTimeout(() => { if (this._state !== 1) return; this._state = 0; this._process(); }, 0);
        }
    }

    clear() {
        this._tasks = [];
        this._state = 0;
    }
}

class Callback {
    private _dispatcher: IDispatcher;
    private _successCB: any;
    private _errorCB: any;

    constructor(dispatcher: IDispatcher, successCB: any, errorCB: any) {
        this._dispatcher = dispatcher;
        this._successCB = successCB;
        this._errorCB = errorCB;
        this.deferred = new Deferred<any>(this._dispatcher);
    }

    resolve(value: any, defer: boolean): void {
        if (!checks.isFunc(this._successCB)) {
            this.deferred.resolve(value);
            return;
        }

        if (!!defer) {
            this._dispatcher(() => this._dispatchCallback(this._successCB, value));
        } else {
            this._dispatchCallback(this._successCB, value);
        }
    }
    reject(error: any, defer: boolean): void {
        if (!checks.isFunc(this._errorCB)) {
            this.deferred.reject(error);
            return;
        }

        if (!!defer) {
            this._dispatcher(() => this._dispatchCallback(this._errorCB, error));
        } else {
            this._dispatchCallback(this._errorCB, error);
        }
    }
    private _dispatchCallback(callback: (arg: any) => any, arg: any): void {
        let result: any;
        try {
            result = callback(arg);
            this.deferred.resolve(result);
        } catch (err) {
            this.deferred.reject(err);
            return;
        }
    }

    public deferred: IDeferred<any>;
}

class Deferred<T> implements IDeferred<T> {
    private _promise: IPromise<T>;
    private _stack: Array<Callback>;
    private _state: PromiseState;
    private _value: T;
    private _error: any;
    private _dispatcher: IDispatcher;

    constructor(dispatcher: IDispatcher) {
        this._dispatcher = dispatcher;
        this._value = undefined;
        this._error = undefined;
        this._state = PromiseState.Pending;
        this._stack = [];
        this._promise = new Promise<T>(this);
    }

    private _resolve(value: any): IDeferred<T> {
        let pending = true;
        try {
            if (checks.isThenable(value)) {
                if (value === this._promise) {
                    throw new TypeError("recursive resolution");
                }
                let fn_then = value.then;
                this._state = PromiseState.ResolutionInProgress;

                fn_then.call(value,
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

                    let i: number, stackSize = this._stack.length;

                    for (i = 0; i < stackSize; i++) {
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
    private _reject(error?: any): IDeferred<T> {
        this._state = PromiseState.ResolutionInProgress;

        this._dispatcher(() => {
            this._state = PromiseState.Rejected;
            this._error = error;

            let stackSize = this._stack.length,
                i = 0;

            for (i = 0; i < stackSize; i++) {
                this._stack[i].reject(error, false);
            }

            this._stack.splice(0, stackSize);
        });

        return this;
    }
    _then(successCB: any, errorCB: any): any {
        if (!checks.isFunc(successCB) && !checks.isFunc(errorCB)) {
            return this._promise;
        }

        let cb = new Callback(this._dispatcher, successCB, errorCB);

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

    resolve(value?: T): IPromise<T>;

    resolve(value?: IPromise<T>): IPromise<T>;

    resolve(value?: any): IPromise<T> {
        if (this._state !== PromiseState.Pending) {
            return this.promise();
        }
        return this._resolve(value).promise();
    }

    reject(error?: any): IPromise<T> {
        if (this._state !== PromiseState.Pending) {
            return this.promise();
        }
        return this._reject(error).promise();
    }

    promise(): IPromise<T> {
        return this._promise;
    }

    state(): PromiseState {
        return this._state;
    }
}

class Promise<T> implements IPromise<T> {
    private _deferred: Deferred<T>;

    constructor(deferred: Deferred<T>) {
        this._deferred = deferred;
    }
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IVoidErrorCB
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IVoidErrorCB
    ): IPromise<TP>;
    then(successCB: any, errorCB: any): any {
        return this._deferred._then(successCB, errorCB);
    }

    fail(errorCB?: coreMOD.IDeferredErrorCB<T>): IPromise<T>;
    fail(errorCB?: coreMOD.IErrorCB<T>): IPromise<T>;
    fail(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;

    fail(errorCB: any): any {
        return this._deferred._then(undefined, errorCB);
    }

    always<TP>(errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
    always<TP>(errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
    always(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;

    always<TP>(errorCB?: any): any {
        return this._deferred._then(errorCB, errorCB);
    }

    state(): PromiseState {
        return this._deferred.state();
    }
}

export class AbortablePromise<T> implements IAbortablePromise<T> {
    private _deferred: IDeferred<T>;
    private _abortable: coreMOD.IAbortable;
    private _aborted: boolean;

    constructor(deferred: IDeferred<T>, abortable: coreMOD.IAbortable) {
        this._deferred = deferred;
        this._abortable = abortable;
        this._aborted = false;
    }
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.IDeferredSuccessCB<T, TP>,
        errorCB?: coreMOD.IVoidErrorCB
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: coreMOD.ISuccessCB<T, TP>,
        errorCB?: coreMOD.IVoidErrorCB
    ): IPromise<TP>;
    then(successCB: any, errorCB: any): any {
        return this._deferred.promise().then(successCB, errorCB);
    }

    fail(errorCB?: coreMOD.IDeferredErrorCB<T>): IPromise<T>;
    fail(errorCB?: coreMOD.IErrorCB<T>): IPromise<T>;
    fail(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;

    fail(errorCB: any): any {
        return this._deferred.promise().fail(errorCB);
    }

    always<TP>(errorCB?: coreMOD.IDeferredErrorCB<TP>): IPromise<TP>;
    always<TP>(errorCB?: coreMOD.IErrorCB<TP>): IPromise<TP>;
    always(errorCB?: coreMOD.IVoidErrorCB): IPromise<void>;

    always<TP>(errorCB?: any): any {
        return this._deferred.promise().always(errorCB);
    }

    abort(reason?: string): void {
        if (this._aborted)
            return;
        let self = this;
        self._deferred.reject(new coreMOD.AbortError(reason));
        self._aborted = true;
        setTimeout(() => { self._abortable.abort(); }, 0);
    }
    state() {
        return this._deferred.state();
    }
}

const taskQueue = new TaskQueue();