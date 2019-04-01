/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
export const enum PromiseState { Pending, ResolutionInProgress, Resolved, Rejected }

export interface IPromiseState {
    state(): PromiseState;
}

export interface ITaskQueue {
    enque(task: () => void): number;
    cancel(taskId: number): void;
}

export interface IAbortable {
    abort(reason?: string): void;
}

export interface IThenable<T> {
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1> | IThenable<TResult1> | IPromise<TResult1> | IStatefulPromise<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2> | IThenable<TResult2> | IPromise<TResult2> | IStatefulPromise<TResult2>) | undefined | null
    ): IThenable<TResult1 | TResult2>;
}

export interface IPromise<T> {
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | IThenable<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | IThenable<TResult2>) | undefined | null
    ): IPromise<TResult1 | TResult2>;
    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | IThenable<TResult>) | undefined | null
    ): IPromise<T | TResult>;
    finally(onFinally: () => void): IPromise<T>;
}

export interface IVoidPromise extends IPromise<void> {
}

export interface IStatefulPromise<T> extends IPromiseState {
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | IThenable<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | IThenable<TResult2>) | undefined | null
    ): IStatefulPromise<TResult1 | TResult2>;
    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | IThenable<TResult>) | undefined | null
    ): IStatefulPromise<T | TResult>;
    finally(onFinally: () => void): IStatefulPromise<T>;
}

export interface IAbortablePromise<T> extends IStatefulPromise<T>, IAbortable {
}

export interface IStatefulDeferred<T> extends IPromiseState {
    resolve(value?: T | PromiseLike<T> | IThenable<T> | IPromise<T> | IStatefulPromise<T>): IStatefulPromise<T>;
    reject(error?: any): IStatefulPromise<T>;
    promise(): IStatefulPromise<T>;
}

export type IDeferred<T> = IStatefulDeferred<T>;
