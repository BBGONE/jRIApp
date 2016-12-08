/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, BaseObject, IVoidPromise, IBaseObject, Debounce } from "jriapp_shared";
import { ITemplate, ITemplateEvents, IViewOptions } from "jriapp/int";
import { createTemplate } from "jriapp/template";
import { bootstrap } from "jriapp/bootstrap";
import { BaseElView } from "./baseview";

const utils = Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, sys = utils.sys, dom = utils.dom;

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
    private _debounce: Debounce;

    constructor(options: IDynaContentOptions) {
        super(options);
        this._dataContext = null;
        this._prevTemplateID = null;
        this._templateID = null;
        this._template = null;
        this._animation = null;
        this._debounce = new Debounce();
    }
    templateLoading(template: ITemplate): void {
        if (this.getIsDestroyCalled())
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
        if (!dom.isContained(template.el, this.el)) {
            this.el.appendChild(template.el);
        }

        const isFirstShow = !this._prevTemplateID,
            canShow = !!this._animation && (this._animation.isAnimateFirstShow || (!this._animation.isAnimateFirstShow && !isFirstShow));
        if (canShow) {
            this._animation.show(template, isFirstShow);
        }
    }
    templateUnLoading(template: ITemplate): void {
        //noop
    }
    private _templateChanging(oldName: string, newName: string) {
        const self = this;
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
            utils.err.reThrow(ex, this.handleError(ex, this));
        }

        try {
            if (!this._template) {
                this._template = createTemplate(this._dataContext, this);
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
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
    }
    destroy() {
        if (this._isDestroyed)
            return
        this._isDestroyCalled = true;
        this._debounce.destroy();
        this._debounce = null;
        const a = this._animation;
        this._animation = null;
        const t = this._template;
        this._template = null;

        if (sys.isBaseObj(a)) {
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
        const self = this, old = self._templateID;
        if (old !== v) {
            this._prevTemplateID = old;
            this._templateID = v;
            this.raisePropertyChanged(PROP_NAME.templateID);
            this._debounce.enqueue(() => {
                if (self.getIsDestroyCalled())
                    return;
                self._templateChanging(old, v);
            });
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