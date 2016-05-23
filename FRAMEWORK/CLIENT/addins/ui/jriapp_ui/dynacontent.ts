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
import { ITemplate, IVoidPromise, ITemplateEvents, IBaseObject, IViewOptions } from "jriapp_core/shared";
import { BaseObject } from "jriapp_core/object";
import { Utils as utils, ERROR } from "jriapp_utils/utils";
import { bootstrap } from "jriapp_core/bootstrap";
import { BaseElView } from "jriapp_elview/elview";

const checks = utils.check, strUtils = utils.str, coreUtils = utils.core;

export interface IDynaContentAnimation {
    beforeShow(template: ITemplate, isFirstShow: boolean): void;
    show(template: ITemplate, isFirstShow: boolean): IVoidPromise;
    beforeHide(template: ITemplate): void;
    hide(template: ITemplate): IVoidPromise;
    stop(): void;
    isAnimateFirstShow: boolean;
}

export interface IDynaContentOptions extends IViewOptions {
    animate?: string;
}

const PROP_NAME = {
    template: "template",
    templateID: "templateID",
    dataContext: "dataContext",
    animation: "animation"
};

export class DynaContentElView extends BaseElView implements ITemplateEvents {
    private _dataContext: any;
    private _prevTemplateID: string;
    private _templateID: string;
    private _template: ITemplate;
    private _animation: IDynaContentAnimation;

    constructor(options: IDynaContentOptions) {
        super(options);
        this._dataContext = null;
        this._prevTemplateID = null;
        this._templateID = null;
        this._template = null;
        this._animation = null;
   }
    templateLoading(template: ITemplate): void {
        if (this._isDestroyCalled)
            return;
        let isFirstShow = !this._prevTemplateID,
            canShow = !!this._animation && (this._animation.isAnimateFirstShow || (!this._animation.isAnimateFirstShow && !isFirstShow));
        if (canShow) {
            this._animation.beforeShow(template, isFirstShow);
       }
   }
    templateLoaded(template: ITemplate, error?: any): void {
        if (this.getIsDestroyCalled())
            return;
        if (!utils.dom.isContained(template.el, this.el)) {
            this.el.appendChild(template.el);
       }

        let isFirstShow = !this._prevTemplateID,
            canShow = !!this._animation && (this._animation.isAnimateFirstShow || (!this._animation.isAnimateFirstShow && !isFirstShow));
        if (canShow) {
            this._animation.show(template, isFirstShow);
       }
   }
    templateUnLoading(template: ITemplate): void {
        //noop
   }
    private _templateChanging(oldName: string, newName: string) {
        let self = this;
        try {
            if (!newName && !!this._template) {
                if (!!this._animation && !!this._template.loadedElem) {
                    this._animation.stop();
                    this._animation.beforeHide(this._template);
                    this._animation.hide(this._template).always(() => {
                        if (self.getIsDestroyCalled())
                            return;
                        self._template.destroy();
                        self._template = null;
                        self.raisePropertyChanged(PROP_NAME.template);

                   });
               }
                else {
                    self._template.destroy();
                    self._template = null;
                    self.raisePropertyChanged(PROP_NAME.template);
               }
                return;
           }
       } catch (ex) {
            this.handleError(ex, this);
            ERROR.throwDummy(ex);
       }

        try {
            if (!this._template) {
                this._template = this.app.createTemplate(this._dataContext, this);
                this._template.templateID = newName;
                self.raisePropertyChanged(PROP_NAME.template);
                return;
           }
            if (!!this._animation && !!this._template.loadedElem) {
                this._animation.stop();
                this._animation.beforeHide(this._template);
                this._animation.hide(this._template).always(() => {
                    if (self.getIsDestroyCalled())
                        return;
                    self._template.templateID = newName;
               });
           }
            else
                self._template.templateID = newName;
       } catch (ex) {
            this.handleError(ex, this);
            ERROR.throwDummy(ex);
       }
   }
    destroy() {
        if (this._isDestroyed)
            return
        this._isDestroyCalled = true;
        let a = this._animation;
        this._animation = null;
        let t = this._template;
        this._template = null;

        if (checks.isBaseObject(a)) {
            (<IBaseObject><any>a).destroy();
       }
        if (!!t) {
            t.destroy();
       }
        this._dataContext = null;
        super.destroy();
   }
    get template() { return this._template; }

    get templateID() {
        return this._templateID;
   }
    set templateID(v: string) {
        let old = this._templateID;
        if (old !== v) {
            this._prevTemplateID = this._templateID;
            this._templateID = v;
            this._templateChanging(old, v);
            this.raisePropertyChanged(PROP_NAME.templateID);
       }
   }
    get dataContext() { return this._dataContext; }
    set dataContext(v) {
        if (this._dataContext !== v) {
            this._dataContext = v;
            if (!!this._template) {
                this._template.dataContext = this._dataContext;
           }
            this.raisePropertyChanged(PROP_NAME.dataContext);
       }
   }
    get animation() { return this._animation; }
    set animation(v) {
        if (this._animation !== v) {
            this._animation = v;
            this.raisePropertyChanged(PROP_NAME.animation);
       }
   }
}

bootstrap.registerElView("dynacontent", DynaContentElView);