export interface ITaskQueue {
    enque(task: () => void): void;
}

export interface IAbortable {
    abort(reason?: string): void;
}

export interface ISuccessCB<T, TP> {
    (value: T): TP;
}

export interface IDeferredSuccessCB<T, TP> {
    (value: T): IThenable<TP>;
}

export interface IErrorCB<TP> {
    (err: any): TP;
}

export interface IVoidErrorCB {
    (err: any): void;
}

export interface IDeferredErrorCB<TP> {
    (error: any): IThenable<TP>;
}

export interface IThenable<T> {
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IThenable<TP>;

    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IThenable<TP>;

    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IThenable<TP>;

    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IThenable<TP>;
}

export interface IPromise<T> extends IThenable<T> {
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IVoidErrorCB
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IVoidErrorCB
    ): IPromise<TP>;

    always<TP>(errorCB?: IDeferredErrorCB<TP>): IPromise<TP>;
    always<TP>(errorCB?: IErrorCB<TP>): IPromise<TP>;
    always(errorCB?: IVoidErrorCB): IPromise<void>;

    fail(errorCB?: IDeferredErrorCB<T>): IPromise<T>;
    fail(errorCB?: IErrorCB<T>): IPromise<T>;
    fail(errorCB?: IVoidErrorCB): IPromise<void>;
}

export interface IVoidPromise extends IPromise<void> {
}

export interface IDeferred<T> {
    resolve(value?: IThenable<T>): IPromise<T>;
    resolve(value?: T): IPromise<T>;
    reject(error?: any): IPromise<T>;
    promise(): IPromise<T>;
}

export const enum PromiseState { Pending, ResolutionInProgress, Resolved, Rejected }

export interface IPromiseState {
    state(): PromiseState;
}

export interface IStatefulPromise<T> extends IPromise<T>, IPromiseState {
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: IDeferredSuccessCB<T, TP>,
        errorCB?: IVoidErrorCB
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IDeferredErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IErrorCB<TP>
    ): IPromise<TP>;
    then<TP>(
        successCB?: ISuccessCB<T, TP>,
        errorCB?: IVoidErrorCB
    ): IPromise<TP>;

    always<TP>(errorCB?: IDeferredErrorCB<TP>): IPromise<TP>;
    always<TP>(errorCB?: IErrorCB<TP>): IPromise<TP>;
    always(errorCB?: IVoidErrorCB): IPromise<void>;

    fail(errorCB?: IDeferredErrorCB<T>): IPromise<T>;
    fail(errorCB?: IErrorCB<T>): IPromise<T>;
    fail(errorCB?: IVoidErrorCB): IPromise<void>;
}

export interface IAbortablePromise<T> extends IStatefulPromise<T>, IAbortable {
}

export interface IStatefulDeferred<T> extends IDeferred<T>, IPromiseState {
    resolve(value?: IThenable<T>): IStatefulPromise<T>;
    resolve(value?: T): IStatefulPromise<T>;
    reject(error?: any): IStatefulPromise<T>;
    promise(): IStatefulPromise<T>;
}