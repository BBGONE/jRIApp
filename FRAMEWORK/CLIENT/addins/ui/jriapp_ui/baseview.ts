/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, BaseObject, IPropertyBag, IValidationInfo, IValidatable } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { ViewChecks } from "jriapp/utils/viewchecks";
import { TOOLTIP_SVC, DATA_ATTR, SubscribeFlags } from "jriapp/const";
import { IElView, IElViewStore, IApplication, IViewOptions, ISubscriber, ITooltipService } from "jriapp/int";
import { bootstrap, subscribeWeakMap } from "jriapp/bootstrap";
import { ICommand } from "jriapp/mvvm";
import { EventBag, EVENT_CHANGE_TYPE, IEventChangedArgs } from "./utils/eventbag";
import { PropertyBag } from "./utils/propbag";
import { CSSBag } from "./utils/cssbag";
import { UIERRORS_SVC, IUIErrorsService } from "./int";

export { IEventChangedArgs, EVENT_CHANGE_TYPE };

const utils = Utils, { getNewID } = utils.core, dom = DomUtils, { undefined } = utils.check,
    boot = bootstrap, viewChecks = ViewChecks, subscribeMap = subscribeWeakMap;

viewChecks.isElView = (obj: any) => {
    return !!obj && obj instanceof BaseElView;
};

export function addToolTip(el: Element, tip: string, isError?: boolean, pos?: string) {
    const svc = boot.getSvc<ITooltipService>(TOOLTIP_SVC);
    svc.addToolTip(el, tip, isError, pos);
}

function UIErrorsService(): IUIErrorsService {
    return boot.getSvc<IUIErrorsService>(UIERRORS_SVC);
}

export class BaseElView<TElement extends HTMLElement = HTMLElement> extends BaseObject implements IElView, ISubscriber, IValidatable {
    private _objId: string;
    private _el: TElement;
    private _subscribeFlags: SubscribeFlags;
    private _eventBag: EventBag;
    private _propBag: IPropertyBag;
    private _classBag: IPropertyBag;
    // saves old display before making display: none
    private _display: string;
    private _css: string;
    private _toolTip: string;
    private _errors: IValidationInfo[];

    constructor(el: TElement, options?: IViewOptions) {
        super();
        options = options || {};
        this._el = el;
        this._toolTip = !options.tip ? null : options.tip;
        this._css = !options.css ? null : options.css;
        this._subscribeFlags = !options.nodelegate ? 1 : 0;
        this._objId = getNewID("elv");

        // lazily initialized
        this._eventBag = null;
        this._propBag = null;
        this._classBag = null;

        this._display = null;
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
            this.validationErrors = null;
            this.css = null;
            this._toolTip = null;
            addToolTip(this.el, null);

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
            addToolTip(this.el, this._toolTip);
        }
    }
    protected _setIsSubcribed(flag: SubscribeFlags): void {
        this._subscribeFlags |= (1 << flag);
    }
    protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void {
        this._errors = errors;
        const uierrSvc = UIErrorsService();
        uierrSvc.setErrors(el, errors, this.toolTip);
    }
    isSubscribed(flag: SubscribeFlags): boolean {
        return !!(this._subscribeFlags & (1 << flag));
    }
    toString(): string {
        return "BaseElView";
    }
    get el(): TElement {
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
            this.objEvents.raiseProp("isVisible");
        }
    }
    get validationErrors(): IValidationInfo[] {
        return this._errors;
    }
    set validationErrors(v: IValidationInfo[]) {
        if (this._errors !== v) {
            this._setErrors(this.el, v);
            this.objEvents.raiseProp("validationErrors");
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
            addToolTip(this.el, v);
            this.objEvents.raiseProp("toolTip");
        }
    }
    // stores commands for data binding to the HtmlElement's events
    get events(): IPropertyBag {
        if (!this._eventBag) {
            if (this.getIsStateDirty()) {
                return undefined;
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
                return undefined;
            }
            this._propBag = new PropertyBag(this.el);
        }
        return this._propBag;
    }
    // exposes All CSS Classes for data binding directly to them
    get classes(): IPropertyBag {
        if (!this._classBag) {
            if (this.getIsStateDirty()) {
                return undefined;
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
            this.objEvents.raiseProp("css");
        }
    }
    get app(): IApplication {
        return boot.getApp();
    }
}

// it is registered by two names
boot.registerElView("generic", BaseElView);
boot.registerElView("baseview", BaseElView);
