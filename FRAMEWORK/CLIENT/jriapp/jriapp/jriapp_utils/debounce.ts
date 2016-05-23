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