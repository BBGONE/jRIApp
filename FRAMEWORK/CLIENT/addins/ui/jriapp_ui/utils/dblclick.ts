﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IDisposable } from "jriapp_shared";

export class DblClick implements IDisposable {
    private _isDisposed: boolean;
    private _timer: number;
    private _interval: number;
    private _fnOnClick: () => any;
    private _fnOnDblClick: () => any;

    constructor(interval: number = 0) {
        this._isDisposed = false;
        this._timer = null;
        this._interval = !interval ? 0 : interval;
        this._fnOnClick = null;
        this._fnOnDblClick = null;
    }
    click() {
        const self = this;
        if (!!this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
            if (!!this._fnOnDblClick) {
                this._fnOnDblClick();
            } else if (!!this._fnOnClick) {
                this._fnOnClick();
            }
        } else {
            if (!!this._fnOnClick) {
                this._timer = setTimeout(function () {
                    self._timer = null;
                    if (!!self._fnOnClick) {
                        self._fnOnClick();
                    }
                }, self._interval);
            }
        }
    }
    add(fnOnClick: () => any, fnOnDblClick?: () => any) {
        if (this.getIsDisposed()) {
            return;
        }
        this._fnOnClick = fnOnClick;
        this._fnOnDblClick = fnOnDblClick;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this._isDisposed = true;
        clearTimeout(this._timer);
        this._timer = null;
        this._fnOnClick = null;
        this._fnOnDblClick = null;
    }
    getIsDisposed(): boolean {
        return this._isDisposed;
    }
    get interval() {
        return this._interval;
    }
    set interval(v: number) {
        this._interval = v;
    }
}
