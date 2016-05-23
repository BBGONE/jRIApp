/// <reference path="../jriapp_core/../../thirdparty/jquery.d.ts" />
/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
}