/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IDisposable } from "../int";
import { ITaskQueue } from "./ideferred";
import { getTaskQueue } from "./deferred";

export class Debounce implements IDisposable {
    private _timer: number;
    private _interval: number;
    private _fn: () => any;

    constructor(interval: number = 0) {
        this._timer = null;
        this._interval = !interval ? 0 : interval;
        this._fn = null;
    }
    enqueue(fn: () => any) {
        //important, no error (just return with no action)!!!
        if (this.IsDestroyed)
            return;
        if (!fn)
            throw new Error("Debounce: Invalid operation");
        //the last wins
        this._fn = fn;

        if (!this._timer) {
            const callback = () => {
                const fn = this._fn;
                this._timer = null;
                this._fn = null;
                if (!!fn) {
                    fn();
                }
            };

            if (!this._interval) {
                this._timer = getTaskQueue().enque(callback);
            }
            else {
                this._timer = setTimeout(callback, this._interval);
            }
        }
    }
    destroy(): void {
        if (!!this._timer) {
            if (!this._interval) {
                getTaskQueue().cancel(this._timer);
            }
            else {
                clearTimeout(this._timer);
            }
        }
        this._timer = void 0;
        this._fn = null;
    }
    get interval() {
        return this._interval;
    }
    get IsDestroyed(): boolean {
        return this._timer === void 0;
    }
}