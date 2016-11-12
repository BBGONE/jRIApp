/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as coreMOD from "../jriapp_core/shared";

export class Debounce implements coreMOD.IDisposable {
    private _isDestroyed: boolean;
    private _timer: number;
    private _interval: number;

    constructor(interval: number = 0) {
        this._isDestroyed = false;
        this._timer = null;
        this._interval = !interval ? 0 : interval;
    }
    enqueue(fn: () => any) {
        if (this._isDestroyed)
            return;
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            this._timer = null;
            if (this._isDestroyed)
                return;
            fn();
        }, this._interval);
    }
    destroy(): void {
        if (this._isDestroyed)
            return;
        this._isDestroyed = true;
        clearTimeout(this._timer);
        this._timer = null;
    }
    getIsDestroyed(): boolean {
        return this._isDestroyed;
    }
    getIsDestroyCalled(): boolean {
        return this._isDestroyed;
    }
    get interval() {
        return this._interval;
    }
    set interval(v: number) {
        this._interval = v;
    }
}