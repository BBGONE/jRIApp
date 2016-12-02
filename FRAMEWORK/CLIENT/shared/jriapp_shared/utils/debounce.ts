/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IDisposable } from "../int";

export class Debounce implements IDisposable {
    private _timer: number;
    private _interval: number;

    constructor(interval: number = 0) {
        this._timer = null;
        this._interval = !interval ? 0 : interval;
    }
    enqueue(fn: () => any) {
        if (this._timer === void 0)
            return;

        if (!!this._timer) {
            clearTimeout(this._timer);
        }
        this._timer = setTimeout(() => {
            this._timer = null;
            fn();
        }, this._interval);
    }
    destroy(): void {
        if (!!this._timer) {
            clearTimeout(this._timer);
        }
        this._timer = void 0;
    }
    get interval() {
        return this._interval;
    }
    set interval(v: number) {
        this._interval = v;
    }
}