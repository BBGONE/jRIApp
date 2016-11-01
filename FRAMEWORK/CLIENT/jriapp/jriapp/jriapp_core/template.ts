/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR } from "../jriapp_core/const";
import { ITemplate, ILifeTimeScope, ITemplateEvents, IApplication, IPromise, IVoidPromise, IElView, IViewOptions } from "../jriapp_core/shared";
import { SysChecks, CoreUtils, Checks, StringUtils, ArrayHelper, ERROR } from "../jriapp_utils/coreutils";
import { DomUtils } from "../jriapp_utils/dom";
import { AsyncUtils } from "../jriapp_utils/async";
import { ERRS } from "../jriapp_core/lang";
import { BaseObject }  from "../jriapp_core/object";
import { bootstrap } from "../jriapp_core/bootstrap";
import { BaseElView } from "../jriapp_elview/elview";
import { CommandElView } from "../jriapp_elview/command";
import { Binding } from "binding";

const defer = AsyncUtils, dom = DomUtils, $ = dom.$, doc = dom.document, coreUtils = CoreUtils,
    checks = Checks, strUtils = StringUtils, arrHelper = ArrayHelper, syschecks = SysChecks;

export const css = {
    templateContainer: "ria-template-container",
    templateError: "ria-template-error"
};

SysChecks._isTemplateElView = (obj: any) => {
    return !!obj && obj instanceof TemplateElView;
};

const PROP_NAME = {
    dataContext: "dataContext",
    templateID: "templateID",
    template: "template",
    isEnabled: "isEnabled"
};

export interface ITemplateOptions {
    app: IApplication;
    dataContext?: any;
    templEvents?: ITemplateEvents;
}

export function create(options: ITemplateOptions): ITemplate {
    return new Template(options);
}

class Template extends BaseObject implements ITemplate {
    private _el: HTMLElement;
    private _lfTime: ILifeTimeScope;
    private _templElView: TemplateElView;
    private _loadedElem: HTMLElement;
    private _app: IApplication;
    private _dataContext: any;
    private _templEvents?: ITemplateEvents;
    private _templateID: string;

    constructor(options: ITemplateOptions) {
        super();
        this._dataContext = options.dataContext;
        this._app = options.app;
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
            if (syschecks._isBinding(arr[i]))
                res.push(<Binding>arr[i]);
        }
        return res;
    }
    private _getElViews(): BaseElView[] {
        if (!this._lfTime)
            return [];
        const arr = this._lfTime.getObjs(), res: BaseElView[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (syschecks._isElView(arr[i]))
                res.push(<BaseElView>arr[i]);
        }
        return res;
    }
    private _getTemplateElView(): TemplateElView {
        if (!this._lfTime)
            return null;
        const arr = this._getElViews();
        for (let i = 0, j = arr.length; i < j; i += 1) {
            if (SysChecks._isTemplateElView(arr[i])) {
                return <TemplateElView>arr[i];
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
            const deferred = defer.createDeferred<HTMLElement>();
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

                bindPromise.fail((err) => {
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
        const promise = self._app._getInternal().bindTemplateElements(loadedEl);
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
    handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return this.app.handleError(error, source);
        }
        return isHandled;
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
        this._app = null
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
            viewStore = self.app.elViewFactory.store;
        els.forEach(function (el) {
            let elView = viewStore.getElView(el);
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
    get app() { return this._app; }
}


export class TemplateElView extends CommandElView implements ITemplateEvents {
    private _template: ITemplate;
    private _isEnabled: boolean;

    constructor(options: IViewOptions) {
        super(options);
        this._template = null;
        this._isEnabled = true;
    }
    templateLoading(template: ITemplate): void {
        //noop
    }
    templateLoaded(template: ITemplate, error?: any): void {
        if (!!error)
            return;
        let self = this;
        try {
            self._template = template;
            let args = { template: template, isLoaded: true };
            self.invokeCommand(args, false);
            this.raisePropertyChanged(PROP_NAME.template);
        }
        catch (ex) {
            this.handleError(ex, this);
            ERROR.throwDummy(ex);
        }
    }
    templateUnLoading(template: ITemplate): void {
        let self = this;
        try {
            let args = { template: template, isLoaded: false };
            self.invokeCommand(args, false);
        }
        catch (ex) {
            this.handleError(ex, this);
        }
        finally {
            self._template = null;
        }
        this.raisePropertyChanged(PROP_NAME.template);
    }
    toString() {
        return "TemplateElView";
    }
    get isEnabled() { return this._isEnabled; }
    set isEnabled(v: boolean) {
        if (this._isEnabled !== v) {
            this._isEnabled = v;
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get template() {
        return this._template;
    }
};

bootstrap.registerElView("template", TemplateElView);