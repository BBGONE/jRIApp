/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IDisposable, TFunc } from "../int";
import { IPromise, IDeferred } from "./ideferred";
import { getTaskQueue, createDefer, Promise } from "./deferred";

export class Debounce implements IDisposable {
    private _timer: number;
    private _interval: number;
    private _fn: TFunc;
    private _deferred: IDeferred<any>;

    constructor(interval: number = 0) {
        this._timer = null;
        this._interval = interval;
        this._fn = null;
        this._deferred = null;
    }
    enque(fn: TFunc): IPromise<any> {
        // important, no error (just return with no action)!!!
        if (this.getIsStateDirty()) {
            return Promise.reject(new Error("disposed"), false);
        }
        if (!fn) {
            throw new Error("Debounce: Invalid operation");
        }
        // the last wins
        this._fn = fn;
        if (!this._deferred) {
            this._deferred = createDefer<any>();
        }

        if (!!this._interval && !!this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        if (!this._timer) {
            const callback = () => {
                const fn = this._fn, deferred = this._deferred;
                this._timer = null;
                this._fn = null;
                this._deferred = null;
                try {
                    if (!!fn && !!deferred) {
                        deferred.resolve(fn());
                    } else {
                        if (!!deferred) {
                            deferred.reject(new Error("cancelled"));
                        }
                    }
                } catch (err) {
                    if (!!deferred) {
                        deferred.reject(err);
                    }
                }
            };

            if (!this._interval) {
                this._timer = getTaskQueue().enque(callback);
            } else {
                this._timer = setTimeout(callback, this._interval);
            }
        }
        return this._deferred.promise();
    }
    cancel() {
        // just set to null
        this._fn = null;
        const deferred = this._deferred;
        if (!!deferred) {
            this._deferred = null;
            deferred.reject(new Error("cancelled"));
        }
    }
    dispose(): void {
        const deferred = this._deferred;
        if (!!this._timer) {
            if (!this._interval) {
                getTaskQueue().cancel(this._timer);
            } else {
                clearTimeout(this._timer);
            }
        }
        this.cancel();
        this._timer = void 0;
        this._fn = null;
        this._deferred = null;
        if (!!deferred) {
            deferred.reject(new Error("disposed"));
       }
    }
    get interval() {
        return this._interval;
    }
    getIsDisposed(): boolean {
        return this._timer === void 0;
    }
    getIsStateDirty(): boolean {
        return this._timer === void 0;
    }
}
