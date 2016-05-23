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

export class DblClick implements coreMOD.IDisposable {
    private _isDestroyed: boolean;
    private _timer: number;
    private _interval: number;
    private _fn_OnClick: () => any;
    private _fn_OnDblClick: () => any;

    constructor(interval: number = 0) {
        this._isDestroyed = false;
        this._timer = null;
        this._interval = !interval ? 0 : interval;
        this._fn_OnClick = null;
        this._fn_OnDblClick = null;
    }
    click() {
        let self = this;
        if (!!this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
            if (!!this._fn_OnDblClick)
                this._fn_OnDblClick();
            else if (!!this._fn_OnClick)
                this._fn_OnClick();
        }
        else {
            if (!!this._fn_OnClick) {
                this._timer = setTimeout(function () {
                    self._timer = null;
                    if (!!self._fn_OnClick)
                        self._fn_OnClick();
                }, self._interval);
            }
        }
    }
    add(fn_OnClick: () => any, fn_OnDblClick?: () => any) {
        if (this._isDestroyed)
            return;
        this._fn_OnClick = fn_OnClick;
        this._fn_OnDblClick = fn_OnDblClick;
    }
    destroy(): void {
        if (this._isDestroyed)
            return;
        this._isDestroyed = true;
        clearTimeout(this._timer);
        this._timer = null;
        this._fn_OnClick = null;
        this._fn_OnDblClick = null;
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