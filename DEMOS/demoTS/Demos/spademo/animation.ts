/// <reference path="../jriapp/jriapp.d.ts" />
import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";

//local variables for optimization
var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;

export class FadeAnimation extends RIAPP.BaseObject implements uiMOD.IDynaContentAnimation {
    private _$animatedEl: JQuery;
    private _effect: string;
    private _duration: number;
    private _isAnimateFirstShow: boolean;

    constructor(isAnimateFirstShow: boolean, duration?: number) {
        super();
        this._$animatedEl = null;
        this._effect = 'fade';
        this._duration = !!duration ? duration : 1000;
        this._isAnimateFirstShow = !!isAnimateFirstShow;
    }
    beforeShow(template: RIAPP.ITemplate, isFirstShow: boolean):void {
    }
    show(template: RIAPP.ITemplate, isFirstShow: boolean): RIAPP.IVoidPromise {
        this.stop();
        this._$animatedEl = $(template.el.parentElement);
        this._$animatedEl.hide();
        var deffered = utils.defer.createDeferred<void>();
        (<any>this._$animatedEl).show(this._effect, this._duration, () => {
            deffered.resolve();
        });
        return deffered.promise();
    }
    beforeHide(template: RIAPP.ITemplate): void {
        this.stop();
        this._$animatedEl = $(template.el.parentElement);
    }
    hide(template: RIAPP.ITemplate): RIAPP.IVoidPromise {
        var deffered = utils.defer.createDeferred<void>();
        (<any>this._$animatedEl).hide(this._effect, this._duration, () => {
            deffered.resolve();
        });
        return deffered.promise();
    }
    stop(): void {
        if (!!this._$animatedEl)
            this._$animatedEl.finish();
    }
    get isAnimateFirstShow() {
        return true;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        try {
            this.stop();
            this._$animatedEl = null;
        }
        finally {
            super.destroy();
        }
    }
}

export class SlideAnimation extends RIAPP.BaseObject implements uiMOD.IDynaContentAnimation {
    private _$animatedEl: JQuery;
    private _effect: string;
    private _duration: number;
    private _isAnimateFirstShow: boolean;

    constructor(isAnimateFirstShow: boolean, duration?: number) {
        super();
        this._$animatedEl = null;
        this._effect = 'slide';
        this._duration = !!duration ? duration : 1000;
        this._isAnimateFirstShow = !!isAnimateFirstShow;
    }
    beforeShow(template: RIAPP.ITemplate, isFirstShow: boolean): void {
    }
    show(template: RIAPP.ITemplate, isFirstShow: boolean): RIAPP.IVoidPromise {
        this.stop();
        this._$animatedEl = $(template.el.parentElement);
        var deffered = utils.defer.createDeferred<void>();
        (<any>this._$animatedEl).show(this._effect, this._duration, () => {
            deffered.resolve();
        });
        return deffered.promise();
    }
    beforeHide(template: RIAPP.ITemplate): void {
        this.stop();
        this._$animatedEl = $(template.el.parentElement);
    }
    hide(template: RIAPP.ITemplate): RIAPP.IVoidPromise {
        var deffered = utils.defer.createDeferred<void>();
        (<any>this._$animatedEl).hide(this._effect, this._duration, () => {
            deffered.resolve();
        });
        return deffered.promise();
    }
    stop(): void {
        if (!!this._$animatedEl)
            this._$animatedEl.finish();
    }
    get isAnimateFirstShow() {
        return true;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        try {
            this.stop();
            this._$animatedEl = null;
        }
        finally {
            super.destroy();
        }
    }
}


//this function is executed when an application which uses this module is created
export function initModule(app: RIAPP.Application) {
    //return something, even null is OK
    return {};
}
