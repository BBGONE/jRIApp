﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    Utils, BaseObject, IPropertyBag, IValidationInfo, LocaleSTRS as STRS
} from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { ViewChecks } from "jriapp/utils/viewchecks";
import { TOOLTIP_SVC, DATEPICKER_SVC, DATA_ATTR, SubscribeFlags } from "jriapp/const";
import { ITooltipService, IElView, IElViewStore, IApplication, IViewOptions, ISubscriber } from "jriapp/int";
import { bootstrap, subscribeWeakMap } from "jriapp/bootstrap";
import { ICommand } from "jriapp/mvvm";
import { EventBag, EVENT_CHANGE_TYPE, IEventChangedArgs } from "./utils/eventbag";
import { PropertyBag } from "./utils/propbag";
import { CSSBag } from "./utils/cssbag";
import { createToolTipSvc } from "./utils/tooltip";
import { createDatepickerSvc } from "./utils/datepicker";

export { IEventChangedArgs, EVENT_CHANGE_TYPE };

const utils = Utils, coreUtils = utils.core, dom = DomUtils, checks = utils.check,
    boot = bootstrap, viewChecks = ViewChecks, subscribeMap = subscribeWeakMap;


viewChecks.isElView = (obj: any) => {
    return !!obj && obj instanceof BaseElView;
};

boot.registerSvc(TOOLTIP_SVC, createToolTipSvc());
boot.registerSvc(DATEPICKER_SVC, createDatepickerSvc());

export function fn_addToolTip(el: Element, tip: string, isError?: boolean, pos?: string) {
    const svc = boot.getSvc<ITooltipService>(TOOLTIP_SVC);
    svc.addToolTip(el, tip, isError, pos);
}

export const enum css {
    fieldError = "ria-field-error",
    commandLink = "ria-command-link",
    checkedNull = "ria-checked-null",
    disabled = "disabled",
    opacity = "opacity",
    color = "color",
    fontSize = "font-size"
}

export const enum PROP_NAME {
    isVisible = "isVisible",
    validationErrors = "validationErrors",
    toolTip = "toolTip",
    css = "css",
    isEnabled = "isEnabled",
    value = "value",
    command = "command",
    disabled = "disabled",
    commandParam = "commandParam",
    isBusy = "isBusy",
    delay = "delay",
    checked = "checked",
    color = "color",
    wrap = "wrap",
    text = "text",
    html = "html",
    preventDefault = "preventDefault",
    imageSrc = "imageSrc",
    glyph = "glyph",
    href = "href",
    fontSize = "fontSize",
    borderColor = "borderColor",
    borderStyle = "borderStyle",
    width = "width",
    height = "height",
    src = "src",
    click = "click"
}

export class BaseElView extends BaseObject implements IElView, ISubscriber {
    private _objId: string;
    private _el: HTMLElement;
    private _subscribeFlags: SubscribeFlags;
    private _eventBag: EventBag;
    private _propBag: IPropertyBag;
    private _classBag: IPropertyBag;
    // saves old display before making display: none
    private _display: string;
    private _css: string;
    private _toolTip: string;
    private _errors: IValidationInfo[];

    constructor(options: IViewOptions) {
        super();
        const el = options.el;
        this._el = el;
        this._toolTip = options.tip;
        this._subscribeFlags = (options.nodelegate === true) ? 0 : 1;
        // lazily initialized
        this._eventBag = null;
        this._propBag = null;
        this._classBag = null;
        this._display = null;
        this._css = options.css;

        this._objId = coreUtils.getNewID("elv");
        this._errors = null;
        if (!!this._css) {
            dom.addClass([el], this._css);
        }
        this._applyToolTip();
        this._getStore().setElView(el, this);
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        try {
            dom.events.offNS(this.el, this.uniqueID);
            this.css = null;
            this._toolTip = null;
            this._setToolTip(this.el, null);
            this.validationErrors = null;
            if (this._subscribeFlags !== 0) {
                subscribeMap.delete(this.el);
                this._subscribeFlags = 0;
            }
            if (!!this._eventBag) {
                this._eventBag.dispose();
                this._eventBag = null;
            }
            if (!!this._propBag) {
                this._propBag.dispose();
                this._propBag = null;
            }
            if (!!this._classBag) {
                this._classBag.dispose();
                this._classBag = null;
            }
        } finally {
            this._getStore().setElView(this.el, null);
            super.dispose();
        }
    }
    private _getStore(): IElViewStore {
        return boot.getApp().viewFactory.store;
    }
    protected _onEventChanged(args: IEventChangedArgs): void {
        switch (args.changeType) {
            case EVENT_CHANGE_TYPE.Added:
                this._onEventAdded(args.name, args.newVal);
                break;
            case EVENT_CHANGE_TYPE.Deleted:
                this._onEventDeleted(args.name, args.oldVal);
                break;
        }
    }
    protected _onEventAdded(name: string, newVal: ICommand): void {
        const self = this;
        if (this.getIsStateDirty()) {
            return;
        }
        dom.events.on(this.el, name, (e) => {
            if (!!self._eventBag) {
                self._eventBag.trigger(name, e);
            }
        }, this.uniqueID);
    }
    protected _onEventDeleted(name: string, oldVal: ICommand): void {
        dom.events.off(this.el, name, this.uniqueID);
    }
    protected _applyToolTip(): void {
        if (!!this._toolTip) {
            this._setToolTip(this.el, this._toolTip);
        }
    }
    protected _getErrorTipInfo(errors: IValidationInfo[]): string {
        const tip = ["<b>", STRS.VALIDATE.errorInfo, "</b>", "<br/>"];
        errors.forEach((info) => {
            let res = "";
            info.errors.forEach((str) => {
                res = res + " " + str;
            });
            tip.push(res);
            res = "";
        });
        return tip.join("");
    }
    protected _setFieldError(isError: boolean): void {
        dom.setClass([this.el], css.fieldError, !isError);
    }
    protected _updateErrorUI(el: HTMLElement, errors: IValidationInfo[]): void {
        if (!el) {
            return;
        }
        if (!!errors && errors.length > 0) {
            fn_addToolTip(el, this._getErrorTipInfo(errors), true);
            this._setFieldError(true);
        } else {
            this._setToolTip(el, this.toolTip);
            this._setFieldError(false);
        }
    }
    protected _setToolTip(el: Element, tip: string, isError?: boolean): void {
        fn_addToolTip(el, tip, isError);
    }
    protected _setIsSubcribed(flag: SubscribeFlags): void {
        this._subscribeFlags |= (1 << flag);
    }
    isSubscribed(flag: SubscribeFlags): boolean {
        return !!(this._subscribeFlags & (1 << flag));
    }
    toString(): string {
        return "BaseElView";
    }
    get el(): HTMLElement {
        return this._el;
    }
    get uniqueID(): string {
        return this._objId;
    }
    get isVisible(): boolean {
        const v = this.el.style.display;
        return !(v === "none");
    }
    set isVisible(v: boolean) {
        v = !!v;
        if (v !== this.isVisible) {
            if (!v) {
                this._display = this.el.style.display;
                // if saved display is none, then don't store it
                if (this._display === "none") {
                    this._display = null;
                }
                this.el.style.display = "none";
            } else {
                this.el.style.display = (!this._display ? "" : this._display);
            }
            this.objEvents.raiseProp(PROP_NAME.isVisible);
        }
    }
    get validationErrors(): IValidationInfo[] {
        return this._errors;
    }
    set validationErrors(v: IValidationInfo[]) {
        if (v !== this._errors) {
            this._errors = v;
            this.objEvents.raiseProp(PROP_NAME.validationErrors);
            this._updateErrorUI(this.el, this._errors);
        }
    }
    get dataName(): string {
        return this._el.getAttribute(DATA_ATTR.DATA_NAME);
    }
    get toolTip(): string {
        return this._toolTip;
    }
    set toolTip(v: string) {
        if (this._toolTip !== v) {
            this._toolTip = v;
            this._setToolTip(this.el, v);
            this.objEvents.raiseProp(PROP_NAME.toolTip);
        }
    }
    // stores commands for data binding to the HtmlElement's events
    get events(): IPropertyBag {
        if (!this._eventBag) {
            if (this.getIsStateDirty()) {
                return checks.undefined;
            }
            this._eventBag = new EventBag((s, a) => {
                this._onEventChanged(a);
            });
        }
        return this._eventBag;
    }
    // exposes All HTML Element properties for data binding directly to them
    get props(): IPropertyBag {
        if (!this._propBag) {
            if (this.getIsStateDirty()) {
                return checks.undefined;
            }
            this._propBag = new PropertyBag(this.el);
        }
        return this._propBag;
    }
    // exposes All CSS Classes for data binding directly to them
    get classes(): IPropertyBag {
        if (!this._classBag) {
            if (this.getIsStateDirty()) {
                return checks.undefined;
            }
            this._classBag = new CSSBag(this.el);
        }
        return this._classBag;
    }
    get isDelegationOn(): boolean {
        return !!(this._subscribeFlags & (1 << SubscribeFlags.delegationOn));
    }
    get css(): string {
        return this._css;
    }
    set css(v: string) {
        const arr: string[] = [];
        if (this._css !== v) {
            if (!!this._css) {
                arr.push("-" + this._css);
            }
            this._css = v;
            if (!!this._css) {
                arr.push("+" + this._css);
            }

            dom.setClasses([this._el], arr);
            this.objEvents.raiseProp(PROP_NAME.css);
        }
    }
    get app(): IApplication {
        return boot.getApp();
    }
}

// it is registered by two names
boot.registerElView("generic", BaseElView);
boot.registerElView("baseview", BaseElView);
