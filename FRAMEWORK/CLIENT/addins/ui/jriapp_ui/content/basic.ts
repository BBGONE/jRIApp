/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE } from "jriapp_shared/collection/const";
import {
    IBaseObject, BaseObject, Utils
} from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { DomUtils } from "jriapp/utils/dom";
import { BINDING_MODE } from "jriapp/const";
import {
    IContent, IContentOptions, IConstructorContentOptions, ILifeTimeScope, IElView,
    IViewOptions, IBindingInfo, IBindingOptions, IApplication
} from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { Binding, getBindingOptions } from "jriapp/binding";
import { LifeTimeScope } from "jriapp/utils/lifetime";

import { css } from "./int";

const utils = Utils, dom = DomUtils, doc = dom.document, coreUtils = utils.core,
   boot = bootstrap, sys = utils.sys;

export class BasicContent extends BaseObject implements IContent {
    protected _parentEl: HTMLElement;
    protected _el: HTMLElement;
    protected _options: IContentOptions;
    protected _isReadOnly: boolean;
    private _isEditing: boolean;
    protected _dataContext: any;
    protected _lfScope: ILifeTimeScope;
    // the target of the data binding
    protected _target: IElView;

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
        this._target = null;
        dom.addClass([this._parentEl], css.content);
    }
    protected updateCss() {
        const displayInfo = this._options.displayInfo, el = this._parentEl, fieldInfo = this.getFieldInfo();
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
        } else {
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
    protected createTargetElement(): IElView {
        let el: HTMLElement;
        const info: { name: string; options: any; } = { name: null, options: null };
        if (this._isEditing && this.getIsCanBeEdited()) {
            el = doc.createElement("input");
            el.setAttribute("type", "text");
            info.options = this._options.options;
        } else {
            el = doc.createElement("span");
        }
        this.updateCss();
        this._el = el;
        return this.getElementView(this._el, info);
    }
    protected getBindingOption(bindingInfo: IBindingInfo, target: IBaseObject, dataContext: any, targetPath: string): IBindingOptions {
        const options: IBindingOptions = getBindingOptions(bindingInfo, target, dataContext);

        if (this.isEditing && this.getIsCanBeEdited()) {
            options.mode = BINDING_MODE.TwoWay;
        } else {
            options.mode = BINDING_MODE.OneWay;
        }

        if (!!targetPath) {
            options.targetPath = targetPath;
        }
        return options;
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
    protected updateBindingSource() {
        const bindings = this.getBindings(), len = bindings.length;
        for (let i = 0; i < len; i += 1) {
            const binding: Binding = bindings[i];
            if (!binding.isSourceFixed) {
                binding.source = this._dataContext;
            }
        }
    }
    protected cleanUp() {
        if (!!this._lfScope) {
            this._lfScope.destroy();
            this._lfScope = null;
        }
        if (!!this._el) {
            dom.removeNode(this._el);
            this._el = null;
        }
        this._target = null;
    }
    protected getElementView(el: HTMLElement, viewInfo: { name: string; options: IViewOptions; }): IElView {
        const factory = boot.getApp().viewFactory, elView = factory.store.getElView(el);
        if (!!elView) {
            return elView;
        }
        viewInfo.options = coreUtils.merge({ el: el }, viewInfo.options);
        return factory.createElView(viewInfo);
    }
    protected getFieldInfo(): IFieldInfo {
        return this._options.fieldInfo;
    }
    render() {
        try {
            this.cleanUp();
            const bindingInfo = this._options.bindingInfo;
            if (!!bindingInfo) {
                this._target = this.createTargetElement();
                this._lfScope = new LifeTimeScope();
                if (!!this._target) {
                    this._lfScope.addObj(this._target);
                }
                const options = this.getBindingOption(bindingInfo, this._target, this._dataContext, "value");
                this._parentEl.appendChild(this._el);
                this._lfScope.addObj(this.app.bind(options));
            }
        } catch (ex) {
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        const displayInfo = this._options.displayInfo;
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
        super.destroy();
    }
    toString() {
        return "BasicContent";
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
    get app(): IApplication {
        return boot.getApp();
    }
}
