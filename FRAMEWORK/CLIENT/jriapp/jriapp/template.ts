/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    BaseObject, Utils, IErrorHandler, IBaseObject, LocaleERRS,
    IPromise, IVoidPromise
} from "jriapp_shared";
import { DATA_ATTR } from "./const";
import {
    ITemplate, ILifeTimeScope, ITemplateEvents,
    IApplication, IElView, IViewOptions
} from "./int";
import { bootstrap } from "./bootstrap";
import { Binding } from "binding";
import { ViewChecks } from "./utils/viewchecks";
import { $ } from "./utils/jquery";

const utils = Utils, _async = utils.defer, dom = utils.dom, viewChecks = ViewChecks,
    doc = dom.document, coreUtils = utils.core, checks = utils.check, strUtils = utils.str,
    arrHelper = utils.arr, sys = utils.sys, boot = bootstrap, ERRS = LocaleERRS, ERROR = utils.err,
    win = dom.window;

export const css = {
    templateContainer: "ria-template-container",
    templateError: "ria-template-error"
};

const PROP_NAME = {
    dataContext: "dataContext",
    templateID: "templateID",
    template: "template",
    isEnabled: "isEnabled"
};

export interface ITemplateOptions {
    dataContext?: any;
    templEvents?: ITemplateEvents;
}

export function createTemplate(dataContext ?: any, templEvents?: ITemplateEvents): ITemplate {
    const options: ITemplateOptions = {
        dataContext: dataContext,
        templEvents: templEvents
    }
    return new Template(options);
}

class Template extends BaseObject implements ITemplate {
    private _el: HTMLElement;
    private _lfTime: ILifeTimeScope;
    private _templElView: ITemplateEvents;
    private _loadedElem: HTMLElement;
    private _dataContext: any;
    private _templEvents?: ITemplateEvents;
    private _templateID: string;

    constructor(options: ITemplateOptions) {
        super();
        this._dataContext = options.dataContext;
        this._templEvents = options.templEvents;
        this._loadedElem = null;
        this._lfTime = null;
        this._templateID = null;
        this._templElView = null;
        this._el = doc.createElement("div");
        this._el.className = css.templateContainer;
    }
    private _getBindings(): Binding[] {
        if (!this._lfTime)
            return [];
        const arr = this._lfTime.getObjs(), res: Binding[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (sys.isBinding(arr[i]))
                res.push(<Binding>arr[i]);
        }
        return res;
    }
    private _getElViews(): IElView[] {
        if (!this._lfTime)
            return [];
        const arr = this._lfTime.getObjs(), res: IElView[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (viewChecks.isElView(arr[i]))
                res.push(<IElView>arr[i]);
        }
        return res;
    }
    private _getTemplateElView(): ITemplateEvents {
        if (!this._lfTime)
            return null;
        const arr = this._getElViews();
        for (let i = 0, j = arr.length; i < j; i += 1) {
            if (viewChecks.isTemplateElView(arr[i])) {
                return <ITemplateEvents><any>arr[i];
            }
        }
        return null;
    }
    /**
       * returns a promise which resolves with the loaded template's DOM element
    */
    private _loadAsync(name: string): IPromise<HTMLElement> {
        let self = this, fn_loader = this.app.getTemplateLoader(name), promise: IPromise<string>;
        if (checks.isFunc(fn_loader) && checks.isThenable(promise = fn_loader())) {
            return promise.then((html: string) => {
                let tmpDiv: HTMLElement = doc.createElement("div");
                tmpDiv.innerHTML = html;
                tmpDiv = <HTMLElement>tmpDiv.firstElementChild;
                return tmpDiv;
            }, (err) => {
                if (!!err && !!err.message)
                    throw err;
                else
                    throw new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
            });
        }
        else {
            const deferred = _async.createDeferred<HTMLElement>();
            return deferred.reject(new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID)));
        }
    }
    private _loadTemplate(): void {
        const self = this, id = self.templateID, templateEl = self.el;
        try {
            if (!!self._loadedElem)
                self._unloadTemplate();

            if (!!id) {
                const loadPromise = self._loadAsync(id), bindPromise = loadPromise.then((loadedEl) => {
                    return self._dataBind(templateEl, loadedEl);
                });

                bindPromise.catch((err) => {
                    if (self.getIsDestroyCalled())
                        return;
                    self._onFail(templateEl, err);
                });
            }
        } catch (ex) {
            self._onFail(templateEl, ex);
        }
    }
    private _onLoading() {
        if (!!this._templEvents) {
            this._templEvents.templateLoading(this);
        }
    }
    private _onLoaded(error?: any) {
        this._templElView = this._getTemplateElView();
        if (!!this._templEvents) {
            this._templEvents.templateLoaded(this, error);
        }
        if (!!this._templElView) {
            this._templElView.templateLoaded(this, error);
        }
    }
    private _unloadTemplate() {
        try {
            if (!!this._templEvents) {
                this._templEvents.templateUnLoading(this);
            }
            if (!!this._templElView) {
                this._templElView.templateUnLoading(this);
            }
        }
        finally {
            this._cleanUp();
        }
    }
    private _dataBind(templateEl: HTMLElement, loadedEl: HTMLElement): IPromise<HTMLElement> {
        const self = this;
        if (self.getIsDestroyCalled())
            ERROR.abort();
        if (!loadedEl)
            throw new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));

        if (!!self._loadedElem) {
            self._unloadTemplate();
        }
        dom.setClass([templateEl], css.templateError, true);
        self._loadedElem = loadedEl;
        self._onLoading();
        templateEl.appendChild(loadedEl);
        const promise = self.app._getInternal().bindTemplateElements(loadedEl);
        return promise.then((lftm) => {
            if (self.getIsDestroyCalled()) {
                lftm.destroy();
                ERROR.abort();
            }
            self._lfTime = lftm;
            self._updateBindingSource();
            self._onLoaded(null);
            return loadedEl;
        });
    }
    private _onFail(templateEl: HTMLElement, err: any): void {
        const self = this;
        if (self.getIsDestroyCalled())
            return;
        self._onLoaded(err);
        if (ERROR.checkIsAbort(err)) {
            return;
        }
        dom.setClass([templateEl], css.templateError, false);
        let ex: any;
        if (!!err) {
            if (!!err.message)
            {
                ex = err;
            }
            else if (!!err.statusText) {
                ex = new Error(err.statusText);
            }
            else {
                ex = new Error('error: ' + err);
            }
        }
        if (!ex)
            ex = new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
        self.handleError(ex, self);
    }
    private _updateBindingSource() {
        let i: number, len: number, binding: Binding, bindings = this._getBindings();
        for (i = 0, len = bindings.length; i < len; i += 1) {
            binding = bindings[i];
            if (!binding.isSourceFixed)
                binding.source = this.dataContext;
        }
    }
    private _cleanUp() {
        if (!!this._lfTime) {
            this._lfTime.destroy();
            this._lfTime = null;
        }

        this._templElView = null;

        if (!!this._loadedElem) {
            //remove with jQuery method to ensure proper cleanUp
            $(this._loadedElem).remove();
            this._loadedElem = null;
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._unloadTemplate();
        if (!!this._el) {
            //remove with jQuery method to ensure proper cleanUp
            $(this._el).remove();
            this._el = null;
        }
        this._dataContext = null;
        this._templEvents = null;
        super.destroy();
    }
    //find elements which has specific data-name attribute value
    //returns plain array of elements, or empty array
    findElByDataName(name: string): HTMLElement[] {
        return arrHelper.fromList<HTMLElement>(this._el.querySelectorAll(["*[", DATA_ATTR.DATA_NAME, '="', name, '"]'].join("")));
    }
    findElViewsByDataName(name: string): IElView[] {
        //first return elements with the needed data attributes those are inside template
        const self = this, els = this.findElByDataName(name), res: IElView[] = [],
            viewStore = boot.getApp().viewFactory.store;
        els.forEach(function (el) {
            const elView = viewStore.getElView(el);
            if (!!elView)
                res.push(elView);
        });
        return res;
    }
    toString() {
        return "ITemplate";
    }
    get loadedElem() {
        return this._loadedElem;
    }
    get dataContext() { return this._dataContext; }
    set dataContext(v) {
        if (this._dataContext !== v) {
            this._dataContext = v;
            this._updateBindingSource();
            this.raisePropertyChanged(PROP_NAME.dataContext);
        }
    }
    get templateID() { return this._templateID; }
    set templateID(v) {
        if (this._templateID !== v) {
            this._templateID = v;
            this._loadTemplate();
            this.raisePropertyChanged(PROP_NAME.templateID);
        }
    }
    get el() { return this._el; }
    get app(): IApplication {
        return bootstrap.getApp();
    }
}