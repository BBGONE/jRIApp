/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseObject, Utils, LocaleERRS, IPromise } from "jriapp_shared";
import { DATA_ATTR } from "./const";
import {
    ITemplate, ILifeTimeScope, ITemplateEvents, IApplication, IElView
} from "./int";
import { bootstrap } from "./bootstrap";
import { Binding } from "binding";
import { ViewChecks } from "./utils/viewchecks";
import { DomUtils } from "./utils/dom";

const utils = Utils, _async = utils.defer, dom = DomUtils, viewChecks = ViewChecks,
    doc = dom.document, { isFunc, isThenable } = utils.check, { format } = utils.str,
    arrHelper = utils.arr, sys = utils.sys, boot = bootstrap, ERRS = LocaleERRS, ERROR = utils.err;

export const enum css {
    templateContainer = "ria-template-container",
    templateError = "ria-template-error"
}

export interface ITemplateOptions {
    dataContext?: any;
    templEvents?: ITemplateEvents;
}

export function createTemplate(dataContext ?: any, templEvents?: ITemplateEvents): ITemplate {
    const options: ITemplateOptions = {
        dataContext: dataContext,
        templEvents: templEvents
    };
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
        if (!this._lfTime) {
            return [];
        }
        const arr = this._lfTime.getObjs(), res: Binding[] = [], len = arr.length;
        for (let i = 0; i < len; i += 1) {
            if (sys.isBinding(arr[i])) {
                res.push(<Binding>arr[i]);
            }
        }
        return res;
    }
    private _getElViews(): IElView[] {
        if (!this._lfTime) {
            return [];
        }
        const arr = this._lfTime.getObjs(), res: IElView[] = [], len = arr.length;
        for (let i = 0; i < len; i += 1) {
            if (viewChecks.isElView(arr[i])) {
                res.push(<IElView>arr[i]);
            }
        }
        return res;
    }
    private _getTemplateElView(): ITemplateEvents {
        if (!this._lfTime) {
            return null;
        }
        const arr = this._getElViews(), j = arr.length;
        for (let i = 0; i < j; i += 1) {
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
        const self = this, fnLoader = this.app.getTemplateLoader(name);
        let promise: IPromise<string>;
        if (isFunc(fnLoader) && isThenable(promise = fnLoader())) {
            return promise.then((html: string) => {
                const elems = dom.fromHTML(html);
                return elems[0];
            }, (err) => {
                if (!!err && !!err.message) {
                    throw err;
                } else {
                    throw new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
                }
            });
        } else {
            const deferred = _async.createDeferred<HTMLElement>();
            return deferred.reject(new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID)));
        }
    }
    private _loadTemplate(): void {
        const self = this, id = self.templateID, templateEl = self.el;
        try {
            if (!!self._loadedElem) {
                self._unloadTemplate();
            }

            if (!!id) {
                const loadPromise = self._loadAsync(id), bindPromise = loadPromise.then((loadedEl) => {
                    return self._dataBind(templateEl, loadedEl);
                });

                bindPromise.catch((err) => {
                    if (self.getIsStateDirty()) {
                        return;
                    }
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
        } finally {
            this._cleanUp();
        }
    }
    private _dataBind(templateEl: HTMLElement, loadedEl: HTMLElement): IPromise<HTMLElement> {
        const self = this;
        if (self.getIsStateDirty()) {
            ERROR.abort();
        }
        if (!loadedEl) {
            throw new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
        }

        if (!!self._loadedElem) {
            self._unloadTemplate();
        }
        dom.setClass([templateEl], css.templateError, true);
        self._loadedElem = loadedEl;
        self._onLoading();
        templateEl.appendChild(loadedEl);
        const promise = self.app._getInternal().bindTemplate(loadedEl, this.dataContext);
        return promise.then((lftm) => {
            if (self.getIsStateDirty()) {
                lftm.dispose();
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
        if (self.getIsStateDirty()) {
            return;
        }
        self._onLoaded(err);
        if (ERROR.checkIsAbort(err)) {
            return;
        }
        dom.setClass([templateEl], css.templateError, false);
        let ex: any;
        if (!!err) {
            if (!!err.message) {
                ex = err;
            } else if (!!err.statusText) {
                ex = new Error(err.statusText);
            } else {
                ex = new Error("error: " + err);
            }
        }
        if (!ex) {
            ex = new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
        }
        self.handleError(ex, self);
    }
    private _updateBindingSource() {
        const bindings = this._getBindings(), len = bindings.length;
        for (let i = 0; i < len; i += 1) {
            const binding = bindings[i];
            if (!binding.isSourceFixed) {
                binding.source = this.dataContext;
            }
        }
    }
    private _cleanUp() {
        if (!!this._lfTime) {
            this._lfTime.dispose();
            this._lfTime = null;
        }

        this._templElView = null;

        if (!!this._loadedElem) {
            dom.removeNode(this._loadedElem);
            this._loadedElem = null;
        }
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._unloadTemplate();
        if (!!this._el) {
            dom.removeNode(this._el);
            this._el = null;
        }
        this._dataContext = null;
        this._templEvents = null;
        super.dispose();
    }
    // find elements which has specific data-name attribute value
    // returns plain array of elements, or empty array
    findElByDataName(name: string): HTMLElement[] {
        return arrHelper.fromList<HTMLElement>(this._el.querySelectorAll(["*[", DATA_ATTR.DATA_NAME, '="', name, '"]'].join("")));
    }
    findElViewsByDataName(name: string): IElView[] {
        // first return elements with the needed data attributes those are inside template
        const els = this.findElByDataName(name), res: IElView[] = [],
            viewStore = boot.getApp().viewFactory.store;
        els.forEach((el) => {
            const elView = viewStore.getElView(el);
            if (!!elView) {
                res.push(elView);
            }
        });
        return res;
    }
    toString() {
        return "ITemplate";
    }
    get loadedElem(): HTMLElement {
        return this._loadedElem;
    }
    get dataContext(): any {
        return this._dataContext;
    }
    set dataContext(v) {
        if (this._dataContext !== v) {
            this._dataContext = v;
            this._updateBindingSource();
            this.objEvents.raiseProp("dataContext");
        }
    }
    get templateID(): string {
        return this._templateID;
    }
    set templateID(v) {
        if (this._templateID !== v) {
            this._templateID = v;
            this._loadTemplate();
            this.objEvents.raiseProp("templateID");
        }
    }
    get el(): HTMLElement {
        return this._el;
    }
    get app(): IApplication {
        return bootstrap.getApp();
    }
}
