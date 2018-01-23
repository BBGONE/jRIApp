﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { FIELD_TYPE } from "jriapp_shared/collection/const";
import { IBaseObject, BaseObject, Utils } from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { DomUtils } from "jriapp/utils/dom";
import {
    IContent, IContentOptions, IConstructorContentOptions, ILifeTimeScope, IViewOptions,
    IBindingInfo, IBindingOptions, IApplication, IConverter, IElView, IElViewInfo
} from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { Binding, getBindingOptions } from "jriapp/binding";
import { LifeTimeScope } from "jriapp/utils/lifetime";
import { cssStyles } from "../baseview";

const utils = Utils, dom = DomUtils, doc = dom.document, coreUtils = utils.core,
    boot = bootstrap, sys = utils.sys;

export interface IContentView extends IBaseObject {
    readonly el: HTMLElement;
}

export function getView(el: HTMLElement, name: string, options: IViewOptions): IElView {
    const factory = boot.getApp().viewFactory, elView = factory.store.getElView(el);
    if (!!elView) {
        return elView;
    }
    const viewInfo: IElViewInfo = {
        el: el,
        name: name,
        options: options || {}
    };
    return factory.createElView(viewInfo);
}

export function getBindingOption(isEdit: boolean, fieldName: string, target: IBaseObject, dataContext: any,
    targetPath: string, converter: IConverter = null, param: any = null): IBindingOptions {
    const bindInfo: IBindingInfo = {
        target: null,
        source: null,
        targetPath: null,
        sourcePath: fieldName,
        mode: isEdit ? "TwoWay" : "OneWay",
        converter: null,
        param: null,
        isEval: false
    };
    const options: IBindingOptions = getBindingOptions(bindInfo, target, dataContext);
    if (!!targetPath) {
        options.targetPath = targetPath;
    }
    options.converter = converter;
    options.param = param;
    return options;
}


export class BasicContent extends BaseObject implements IContent {
    private _parentEl: HTMLElement;
    private _options: IContentOptions;
    private _isReadOnly: boolean;
    private _isEditing: boolean;
    private _dataContext: any;
    private _lfScope: ILifeTimeScope;
    // the target of the data binding
    private _view: IContentView;
    protected _el: HTMLElement;

    constructor(options: IConstructorContentOptions) {
        super();
        options = coreUtils.extend(
            {
                parentEl: null,
                contentOptions: null,
                dataContext: null,
                isEditing: false
            }, options);
        this._el = null;
        this._parentEl = options.parentEl;
        this._isEditing = !!options.isEditing;
        this._dataContext = options.dataContext;
        this._options = options.contentOptions;
        this._isReadOnly = !!this._options.readOnly;
        this._lfScope = null;
        this._view = null;
        dom.addClass([this._parentEl], cssStyles.content);
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const displayInfo = this._options.css;
        dom.removeClass([this._parentEl], cssStyles.content);
        dom.removeClass([this._parentEl], cssStyles.required);
        if (!!displayInfo && !!displayInfo.readCss) {
            dom.removeClass([this._parentEl], displayInfo.readCss);
        }
        if (!!displayInfo && !!displayInfo.editCss) {
            dom.removeClass([this._parentEl], displayInfo.editCss);
        }
        this.cleanUp();
        this._parentEl = null;
        this._dataContext = null;
        this._options = null;
        super.dispose();
    }
    protected updateCss(): void {
        const displayInfo = this._options.css, parentEl = this._parentEl,
            fieldInfo = this.getFieldInfo();
        if (this._isEditing && this.getIsCanBeEdited()) {
            if (!!displayInfo) {
                if (!!displayInfo.editCss) {
                    dom.addClass([parentEl], displayInfo.editCss);
                }
                if (!!displayInfo.readCss) {
                    dom.removeClass([parentEl], displayInfo.readCss);
                }
            }
            if (!!fieldInfo && !fieldInfo.isNullable) {
                dom.addClass([parentEl], cssStyles.required);
            }
        } else {
            if (!!displayInfo) {
                if (!!displayInfo.readCss) {
                    dom.addClass([parentEl], displayInfo.readCss);
                }
                if (!!displayInfo.editCss) {
                    dom.removeClass([parentEl], displayInfo.editCss);
                }
            }
            if (!!fieldInfo && !fieldInfo.isNullable) {
                dom.removeClass([parentEl], cssStyles.required);
            }
        }
    }
    protected getIsCanBeEdited(): boolean {
        if (this._isReadOnly) {
            return false;
        }
        const finf = this.getFieldInfo();
        if (!finf) {
            return false;
        }
        const editable = sys.getEditable(this._dataContext);
        return !!editable && !finf.isReadOnly && finf.fieldType !== FIELD_TYPE.Calculated;
    }
    protected getBindings(): Binding[] {
        if (!this._lfScope) {
            return [];
        }
        const arr = this._lfScope.getObjs(), res: Binding[] = [], len = arr.length;
        for (let i = 0; i < len; i += 1) {
            if (sys.isBinding(arr[i])) {
                res.push(<Binding>arr[i]);
            }
        }
        return res;
    }
    protected updateBindingSource(): void {
        const bindings = this.getBindings(), len = bindings.length;
        for (let i = 0; i < len; i += 1) {
            const binding: Binding = bindings[i];
            if (!binding.isSourceFixed) {
                binding.source = this._dataContext;
            }
        }
    }
    protected cleanUp(): void {
        if (!!this._lfScope) {
            this._lfScope.dispose();
            this._lfScope = null;
        }
        if (!!this._el) {
            dom.removeNode(this._el);
            this._el = null;
        }
        this._view = null;
    }
    protected getFieldInfo(): IFieldInfo {
        return this._options.fieldInfo;
    }
    protected getParam(isEdit: boolean): any {
        return null;
    }
    protected getConverter(isEdit: boolean): IConverter {
        return null;
    }
    protected getViewName(isEdit: boolean): string {
        return null;
    }
    protected createdEditingView(): IContentView {
        const name = this.getViewName(true), el = doc.createElement("input"), options = this._options.options;
        el.setAttribute("type", "text");
        if (!!options && !!options.placeholder) {
            el.setAttribute("placeholder", options.placeholder);
        }
        const view = getView(el, name, options);
        if (!!view) {
            this.lfScope.addObj(view);
        }
        const bindOption = getBindingOption(true, this.options.fieldName, view, this.dataContext, "value", this.getConverter(true), this.getParam(true));
        this._lfScope.addObj(this.app.bind(bindOption));
        return view;
    }
    protected createdReadingView(): IContentView {
        const name = this.getViewName(false), el = doc.createElement("span");
        const view = getView(el, name, {});
        if (!!view) {
            this.lfScope.addObj(view);
        }
        const bindOption = getBindingOption(false, this.options.fieldName, view, this.dataContext, "value", this.getConverter(false), this.getParam(false));
        this._lfScope.addObj(this.app.bind(bindOption));
        return view;
    }
    protected beforeCreateView(): boolean {
        this.cleanUp();
        return !!this._options.fieldName;
    }
    protected createView(): void {
        let view: IContentView = null;
        if (this._isEditing && this.getIsCanBeEdited()) {
            view = this.createdEditingView();
        } else {
            view = this.createdReadingView();
        }
        this._el = view.el;
        this._view = view;
        this.updateCss();
    }
    protected afterCreateView(): void {
        this._parentEl.appendChild(this._el);
    }
    render(): void {
        if (this.beforeCreateView()) {
            try {
                this.createView();
                this.afterCreateView();
            } catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            } 
        }
    }
    toString(): string {
        return "BasicContent";
    }
    protected get lfScope(): ILifeTimeScope {
        if (!this._lfScope) {
            this._lfScope = new LifeTimeScope();
        }
        return this._lfScope;
    }
    get parentEl(): HTMLElement {
        return this._parentEl;
    }
    get el(): HTMLElement {
        return this._el;
    }
    get view(): IContentView {
        return this._view;
    }
    get isEditing(): boolean {
        return this._isEditing;
    }
    set isEditing(v) {
        if (this._isEditing !== v) {
            this._isEditing = v;
            this.render();
        }
    }
    get dataContext(): any {
        return this._dataContext;
    }
    set dataContext(v) {
        if (this._dataContext !== v) {
            this._dataContext = v;
            this.updateBindingSource();
        }
    }
    get isReadOnly(): boolean {
        return this._isReadOnly;
    }
    get options(): IContentOptions {
        return this._options;
    }
    get app(): IApplication {
        return boot.getApp();
    }
}
