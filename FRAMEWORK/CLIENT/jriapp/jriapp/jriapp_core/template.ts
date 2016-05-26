/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR } from "../jriapp_core/const";
import { ITemplate, ILifeTimeScope, ITemplateEvents, IApplication, IPromise, IVoidPromise, IElView, IViewOptions } from "../jriapp_core/shared";
import { SysChecks, CoreUtils as coreUtils, Checks as checks, StringUtils as strUtils, ERROR } from "../jriapp_utils/coreutils";
import { DomUtils as dom } from "../jriapp_utils/dom";
import { AsyncUtils as defer } from "../jriapp_utils/async";
import { ERRS } from "../jriapp_core/lang";
import { BaseObject }  from "../jriapp_core/object";
import { bootstrap } from "../jriapp_core/bootstrap";
import { BaseElView } from "../jriapp_elview/elview";
import { CommandElView } from "../jriapp_elview/command";
import { Binding } from "binding";

const $ = dom.$, document = dom.document;

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
    private _options: ITemplateOptions;
    private _templateID: string;

    constructor(options: ITemplateOptions) {
        super();
        this._options = options;
        this._loadedElem = null;
        this._lfTime = null;
        this._templateID = null;
        this._templElView = undefined;
        this._el = document.createElement("div");
        this._el.className = css.templateContainer;
    }
    private _getBindings(): Binding[] {
        if (!this._lfTime)
            return [];
        let arr = this._lfTime.getObjs(), res: Binding[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (SysChecks._isBinding(arr[i]))
                res.push(<Binding>arr[i]);
        }
        return res;
    }
    private _getElViews(): BaseElView[] {
        if (!this._lfTime)
            return [];
        let arr = this._lfTime.getObjs(), res: BaseElView[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (SysChecks._isElView(arr[i]))
                res.push(<BaseElView>arr[i]);
        }
        return res;
    }
    private _getTemplateElView(): TemplateElView {
        if (!this._lfTime || this._templElView === null)
            return null;
        if (!!this._templElView)
            return this._templElView;
        let res: any = null, arr = this._getElViews();
        for (let i = 0, j = arr.length; i < j; i += 1) {
            if (SysChecks._isTemplateElView(arr[i])) {
                res = arr[i];
                break;
            }
        }
        this._templElView = res;
        return res;
    }
    private _getTemplateEvents(): ITemplateEvents[] {
        let tel_vw = this._getTemplateElView(), ev = this._options.templEvents;
        if (!!tel_vw && !!ev)
            return [tel_vw, ev];
        else if (!!tel_vw)
            return [tel_vw];
        else if (!!ev)
            return [ev];
        else
            return [];
    }
    //returns a promise which resolves with the loaded template's DOM element
    private _loadTemplateElAsync(name: string): IPromise<HTMLElement> {
        let self = this, fn_loader = this.app.getTemplateLoader(name), promise: IPromise<string>;

        if (checks.isFunc(fn_loader) && checks.isThenable(promise = fn_loader())) {
            return promise.then((html: string) => {
                let tmpDiv: HTMLElement = document.createElement("div");
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
            let deferred = defer.createDeferred<HTMLElement>();
            return deferred.reject(new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID)));
        }
    }
    private _loadTemplate(): void {
        let self = this, id = self.templateID, templateEl = self.el;
        try {
            if (!!self._loadedElem)
                self._unloadTemplate();

            if (!!id) {
                let loadPromise = self._loadTemplateElAsync(id), bindPromise = loadPromise.then((loadedEl) => {
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
        let tevents = this._getTemplateEvents();
        let len = tevents.length;
        for (let i = 0; i < len; i += 1) {
            tevents[i].templateLoading(this);
        }
    }
    private _onLoaded(error?: any) {
        let tevents = this._getTemplateEvents();
        let len = tevents.length;
        for (let i = 0; i < len; i += 1) {
            tevents[i].templateLoaded(this, error);
        }
    }
    private _dataBind(templateEl: HTMLElement, loadedEl: HTMLElement): IPromise<HTMLElement> {
        let self = this;
        if (self.getIsDestroyCalled())
            ERROR.abort();
        if (!loadedEl)
            throw new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));

        if (!!self._loadedElem) {
            self._unloadTemplate();
        }

        $(templateEl).removeClass(css.templateError);
        self._loadedElem = loadedEl;
        self._onLoading();
        templateEl.appendChild(loadedEl);
        let promise = self.app._getInternal().bindTemplateElements(loadedEl);
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
        let self = this;
        if (self.getIsDestroyCalled())
            return;
        self._onLoaded(err);
        if (ERROR.checkIsAbort(err)) {
            return;
        }
        $(templateEl).addClass(css.templateError);
        let ex: any;
        if (!!err) {
            if (!!err.message)
                ex = err;
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
    private _unloadTemplate() {
        let i: number, tevents = this._getTemplateEvents(), len: number = tevents.length;
        try {
            if (!!this._el) {
                for (i = 0; i < len; i += 1) {
                    tevents[i].templateUnLoading(this);
                }
            }
        }
        finally {
            this._cleanUp();
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
        }
        this._loadedElem = null;

        if (this._isDestroyCalled && !!this._el) {
            //remove with jQuery method to ensure proper cleanUp
            $(this._el).remove();
            this._el = null;
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
        this._options = <any>{};
        super.destroy();
    }
    //find elements which has specific data-name attribute value
    //returns plain array of elements, or empty array
    findElByDataName(name: string): HTMLElement[] {
        let $foundEl = $(this._el).find(["*[", DATA_ATTR.DATA_NAME, '="', name, '"]'].join(""));
        return $foundEl.toArray();
    }
    findElViewsByDataName(name: string): IElView[] {
        //first return elements with the needed data attributes those are inside template
        let self = this, els = this.findElByDataName(name), res: IElView[] = [],
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
    get dataContext() { return this._options.dataContext; }
    set dataContext(v) {
        if (this.dataContext !== v) {
            this._options.dataContext = v;
            this.raisePropertyChanged(PROP_NAME.dataContext);
            this._updateBindingSource();
        }
    }
    get templateID() { return this._templateID; }
    set templateID(v) {
        if (this._templateID !== v) {
            this._templateID = v;
            this.raisePropertyChanged(PROP_NAME.templateID);
            this._loadTemplate();
        }
    }
    get el() { return this._el; }
    get app() { return this._options.app; }
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