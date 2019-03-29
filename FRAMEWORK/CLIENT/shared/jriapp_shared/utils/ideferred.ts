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

export interface IPromise<T> {
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): IPromise<TResult1 | TResult2>;
    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): IPromise<T | TResult>;
    finally<U = any>(onFinally?: ((value: any) => U)): IPromise<U>;
}

export interface IVoidPromise extends IPromise<void> {
}

export interface IDeferred<T> {
    resolve(value?: PromiseLike<T>): IPromise<T>;
    resolve(value?: T): IPromise<T>;
    reject(error?: any): IPromise<T>;
    promise(): IPromise<T>;
}

export interface IStatefulPromise<T> extends IPromiseState {
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): IStatefulPromise<TResult1 | TResult2>;
    catch<TResult = never>(
        onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
    ): IStatefulPromise<T | TResult>;
    finally<U = any>(onFinally?: ((value: any) => U)): IStatefulPromise<U>;
}

export interface IAbortablePromise<T> extends IStatefulPromise<T>, IAbortable {
}

export interface IStatefulDeferred<T> extends IDeferred<T>, IPromiseState {
    resolve(value?: PromiseLike<T>): IStatefulPromise<T>;
    resolve(value?: T): IStatefulPromise<T>;
    reject(error?: any): IStatefulPromise<T>;
    promise(): IStatefulPromise<T>;
}
