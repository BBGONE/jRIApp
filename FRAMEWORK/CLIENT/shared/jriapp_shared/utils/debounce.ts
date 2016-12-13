/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IDisposable } from "../int";

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
        if (this.IsDestroyed)
            throw new Error("Debounce: Object destroyed");
        if (!fn)
            throw new Error("Debounce: Invalid operation");

        this._fn = fn;

        if (!this._timer && !!this._fn) {
            this._timer = setTimeout(() => {
                this._timer = null;
                try {
                    if (!!this._fn) {
                        this._fn();
                    }
                }
                finally {
                    this._fn = null;
                }
            }, this._interval);
        }
    }
    destroy(): void {
        if (!!this._timer) {
            clearTimeout(this._timer);
        }
        this._timer = void 0;
        this._fn = null;
    }
    get interval() {
        return this._interval;
    }
    set interval(v: number) {
        this._interval = v;
    }
    get IsDestroyed(): boolean {
        return this._timer === void 0;
    }
}