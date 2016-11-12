/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
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