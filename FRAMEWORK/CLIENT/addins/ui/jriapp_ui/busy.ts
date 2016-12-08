/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils
} from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { LOADER_GIF } from "jriapp/const";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";


import { BaseElView, PROP_NAME } from "./baseview";

const checks = Utils.check, boot = bootstrap;

export interface IBusyViewOptions extends IViewOptions {
    img?: string
    delay?: number | string;
}

export class BusyElView extends BaseElView {
    private _delay: number;
    private _timeOut: number;
    private _loaderPath: string;
    private _$loader: any;
    private _isBusy: boolean;

    constructor(options: IBusyViewOptions) {
        super(options);
        let img: string;
        if (!!options.img)
            img = options.img;
        else
            img = LOADER_GIF.Default;
        this._delay = 400;
        this._timeOut = null;
        if (!checks.isNt(options.delay))
            this._delay = parseInt("" + options.delay);
        this._loaderPath = bootstrap.getImagePath(img);
        this._$loader = $(new Image());
        this._$loader.css({ position: "absolute", display: "none", zIndex: "10000" });
        this._$loader.prop("src", this._loaderPath);
        this._$loader.appendTo(this.el);
        this._isBusy = false;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._timeOut) {
            clearTimeout(this._timeOut);
            this._timeOut = null;
        }
        this._$loader.remove();
        this._$loader = null;
        super.destroy();
    }
    toString() {
        return "BusyElView";
    }
    get isBusy() { return this._isBusy; }
    set isBusy(v) {
        let self = this, fn = function () {
            self._timeOut = null;
            self._$loader.show();
            self._$loader.position({
                //"my": "right top",
                //"at": "left bottom",
                "of": $(self.el)
            });
        };

        if (v !== self._isBusy) {
            self._isBusy = v;
            if (self._isBusy) {
                if (!!self._timeOut) {
                    clearTimeout(self._timeOut);
                    self._timeOut = null;
                }
                if (self._delay > 0) {
                    self._timeOut = setTimeout(fn, self._delay);
                }
                else
                    fn();
            }
            else {
                if (!!self._timeOut) {
                    clearTimeout(self._timeOut);
                    self._timeOut = null;
                }
                else
                    self._$loader.hide();
            }
            self.raisePropertyChanged(PROP_NAME.isBusy);
        }
    }
    get delay() { return this._delay; }
    set delay(v) {
        if (v !== this._delay) {
            this._delay = v;
            this.raisePropertyChanged(PROP_NAME.delay);
        }
    }
}

boot.registerElView("busy", BusyElView);
boot.registerElView("busy_indicator", BusyElView);