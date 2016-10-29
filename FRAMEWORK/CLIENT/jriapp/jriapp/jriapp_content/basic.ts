/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, BINDING_MODE } from "../jriapp_core/const";
import { IApplication, IContent, IContentOptions, IConstructorContentOptions, ILifeTimeScope, IElView, IViewOptions,
    IBaseObject, IBindingInfo, IBindingOptions, IFieldInfo }  from "../jriapp_core/shared";
import { BaseObject }  from "../jriapp_core/object";
import { Binding, getBindingOptions } from "../jriapp_core/binding";
import { SysChecks, ERROR } from "../jriapp_utils/coreutils";
import { Utils as utils, LifeTimeScope } from "../jriapp_utils/utils";

import { css } from "./int";

const dom = utils.dom, $ = dom.$, doc = utils.dom.document, coreUtils = utils.core;

export class BasicContent extends BaseObject implements IContent {
    protected _parentEl: HTMLElement;
    protected _el: HTMLElement;
    protected _options: IContentOptions;
    protected _isReadOnly: boolean;
    private _isEditing: boolean;
    protected _dataContext: any;
    protected _lfScope: ILifeTimeScope;
    //the target of the data binding
    protected _target: IElView;
    protected _app: IApplication;

    constructor(options: IConstructorContentOptions) {
        super();
        options = coreUtils.extend(
            {
                parentEl: null,
                contentOptions: null,
                dataContext: null,
                isEditing: false,
                app: null
            }, options);
        this._el = null;
        this._app = options.app;
        this._parentEl = options.parentEl;
        this._isEditing = !!options.isEditing;
        this._dataContext = options.dataContext;
        this._options = options.contentOptions;
        this._isReadOnly = !!this._options.readOnly;
        this._lfScope = null;
        this._target = null;
        dom.addClass([this._parentEl], css.content);
        this.init();
        this.render();
    }
    handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return this._app.handleError(error, source);
        }
        return isHandled;
    }
    protected init() { }
    protected updateCss() {
        let displayInfo = this._options.displayInfo, el = this._parentEl, fieldInfo = this.getFieldInfo();
        if (this._isEditing && this.getIsCanBeEdited()) {
            if (!!displayInfo) {
                if (!!displayInfo.editCss) {
                    dom.addClass([el], displayInfo.editCss);
                }
                if (!!displayInfo.displayCss) {
                    dom.removeClass([el], displayInfo.displayCss);
                }
            }
            if (!!fieldInfo && !fieldInfo.isNullable) {
                dom.addClass([el], css.required);
            }
        }
        else {
            if (!!displayInfo) {
                if (!!displayInfo.displayCss) {
                    dom.addClass([el], displayInfo.displayCss);
                }
                if (!!displayInfo.editCss) {
                    dom.removeClass([el], displayInfo.editCss);
                }
            }
            if (!!fieldInfo && !fieldInfo.isNullable) {
                dom.removeClass([el], css.required);
            }
        }
    }
    protected getIsCanBeEdited() {
        if (this._isReadOnly)
            return false;
        let finf = this.getFieldInfo();
        if (!finf)
            return false;
        let editable = utils.getEditable(this._dataContext);
        return !!editable && !finf.isReadOnly && finf.fieldType !== FIELD_TYPE.Calculated;
    }
    protected createTargetElement(): IElView {
        let el: HTMLElement, info: { name: string; options: any; } = { name: null, options: null };
        if (this._isEditing && this.getIsCanBeEdited()) {
            el = doc.createElement("input");
            el.setAttribute("type", "text");
            info.options = this._options.options;
        }
        else {
            el = doc.createElement("span");
        }
        this.updateCss();
        this._el = el;
        return this.getElementView(this._el, info);
    }
    protected getBindingOption(bindingInfo: IBindingInfo, target: IBaseObject, dataContext: any, targetPath: string) {
        let options = getBindingOptions(this.app, bindingInfo, target, dataContext);
        if (this.isEditing && this.getIsCanBeEdited())
            options.mode = BINDING_MODE.TwoWay;
        else
            options.mode = BINDING_MODE.OneWay;
        if (!!targetPath)
            options.targetPath = targetPath;
        return options;
    }
    protected getBindings(): Binding[] {
        if (!this._lfScope)
            return [];
        let arr = this._lfScope.getObjs(), res: Binding[] = [];
        for (let i = 0, len = arr.length; i < len; i += 1) {
            if (SysChecks._isBinding(arr[i]))
                res.push(<Binding>arr[i]);
        }
        return res;
    }
    protected updateBindingSource() {
        let binding: Binding, bindings = this.getBindings();
        for (let i = 0, len = bindings.length; i < len; i += 1) {
            binding = bindings[i];
            if (!binding.isSourceFixed)
                binding.source = this._dataContext;
        }
    }
    protected cleanUp() {
        if (!!this._lfScope) {
            this._lfScope.destroy();
            this._lfScope = null;
        }
        if (!!this._el) {
            utils.dom.removeNode(this._el);
            this._el = null;
        }
        this._target = null;
    }
    protected getElementView(el: HTMLElement, view_info: { name: string; options: IViewOptions; }): IElView {
        let elView = this.app.elViewFactory.store.getElView(el);
        if (!!elView)
            return elView;
        view_info.options = coreUtils.merge({ app: this._app, el: el }, view_info.options);
        return this.app.elViewFactory.createElView(view_info);
    }
    protected getFieldInfo(): IFieldInfo {
        return this._options.fieldInfo;
    }
    protected render() {
        try {
            this.cleanUp();
            let bindingInfo = this._options.bindingInfo;
            if (!!bindingInfo) {
                this._target = this.createTargetElement();
                this._lfScope = new LifeTimeScope();
                if (!!this._target)
                    this._lfScope.addObj(this._target);
                let options = this.getBindingOption(bindingInfo, this._target, this._dataContext, "value");
                this._parentEl.appendChild(this._el);
                this._lfScope.addObj(this.app.bind(options));
            }
        }
        catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let displayInfo = this._options.displayInfo;
        dom.removeClass([this._parentEl], css.content);
        dom.removeClass([this._parentEl], css.required);
        if (!!displayInfo && !!displayInfo.displayCss) {
            dom.removeClass([this._parentEl], displayInfo.displayCss);
        }
        if (!!displayInfo && !!displayInfo.editCss) {
            dom.removeClass([this._parentEl], displayInfo.editCss);
        }
        this.cleanUp();
        this._parentEl = null;
        this._dataContext = null;
        this._options = null;
        this._app = null;
        super.destroy();
    }
    toString() {
        return "BindingContent";
    }
    get parentEl() { return this._parentEl; }
    get target() { return this._target; }
    get isEditing() { return this._isEditing; }
    set isEditing(v) {
        if (this._isEditing !== v) {
            this._isEditing = v;
            this.render();
        }
    }
    get dataContext() { return this._dataContext; }
    set dataContext(v) {
        if (this._dataContext !== v) {
            this._dataContext = v;
            this.updateBindingSource();
        }
    }
    get app() { return this._app; }
}