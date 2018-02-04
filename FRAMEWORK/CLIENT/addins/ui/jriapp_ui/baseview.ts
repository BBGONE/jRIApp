/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, BaseObject, IPropertyBag, IValidationInfo, IValidatable } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { ViewChecks } from "jriapp/utils/viewchecks";
import { SERVICES, DATA_ATTR, SubscribeFlags } from "jriapp/const";
import { IElView, IElViewStore, IApplication, IViewOptions, ISubscriber, ITooltipService } from "jriapp/int";
import { bootstrap, subscribeWeakMap } from "jriapp/bootstrap";
import { ICommand } from "jriapp/mvvm";
import { EventBag, EVENT_CHANGE_TYPE, IEventChangedArgs } from "./utils/eventbag";
import { PropertyBag } from "./utils/propbag";
import { CSSBag } from "./utils/cssbag";
import { IViewErrorsService } from "jriapp/int";

export { IEventChangedArgs, EVENT_CHANGE_TYPE };

const utils = Utils, { getNewID, extend } = utils.core, dom = DomUtils, { _undefined } = utils.check,
    boot = bootstrap, viewChecks = ViewChecks, subscribeMap = subscribeWeakMap;

viewChecks.isElView = (obj: any): obj is IElView => {
    return !!obj && obj instanceof BaseElView;
};

export function addToolTip(el: Element, tip: string, isError?: boolean, pos?: string) {
    const svc = boot.getSvc<ITooltipService>(SERVICES.TOOLTIP_SVC);
    svc.addToolTip(el, tip, isError, pos);
}

function getErrorsService(): IViewErrorsService {
    return boot.getSvc(SERVICES.UIERRORS_SVC);
}

export interface IElViewState extends IViewOptions {
    _eventBag: EventBag;
    _propBag: IPropertyBag;
    _classBag: IPropertyBag;
    // saves old display before making display: none
    _display: string;
    _errors: IValidationInfo[];
}

export class BaseElView<TElement extends HTMLElement = HTMLElement> extends BaseObject implements IElView, ISubscriber, IValidatable {
    private _objId: string;
    private _el: TElement;
    private _subscribeFlags: SubscribeFlags;
    private _elViewState: IElViewState;

    constructor(el: TElement, options?: IViewOptions) {
        super();
        this._el = el;
        const state = <IElViewState>extend(
            {
                tip: null,
                css: null,
                nodelegate: false,
                errorsService: null,
                _eventBag: null,
                _propBag: null,
                _classBag: null,
                _display: null,
                _errors: null
            }, options);
        this._objId = getNewID("elv");
        this._elViewState = state;
        this._subscribeFlags = !state.nodelegate ? 1 : 0;

        if (!!state.css) {
            dom.addClass([el], state.css);
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
            addToolTip(this.el, null);

            if (this._subscribeFlags !== 0) {
                subscribeMap.delete(this.el);
                this._subscribeFlags = 0;
            }
            if (!!this._elViewState._eventBag) {
                this._elViewState._eventBag.dispose();
            }
            if (!!this._elViewState._propBag) {
                this._elViewState._propBag.dispose();
            }
            if (!!this._elViewState._classBag) {
                this._elViewState._classBag.dispose();
            }
            this._elViewState = <any>{};
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
            if (!!self._elViewState._eventBag) {
                self._elViewState._eventBag.trigger(name, e);
            }
        }, this.uniqueID);
    }
    protected _onEventDeleted(name: string, oldVal: ICommand): void {
        dom.events.off(this.el, name, this.uniqueID);
    }
    protected _applyToolTip(): void {
        if (!!this.toolTip) {
            addToolTip(this.el, this.toolTip);
        }
    }
    protected _setIsSubcribed(flag: SubscribeFlags): void {
        this._subscribeFlags |= (1 << flag);
    }
    protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void {
        this._elViewState._errors = errors;
        const errSvc = !this._elViewState.errorsService ? getErrorsService() : this._elViewState.errorsService;
        errSvc.setErrors(el, errors, this.toolTip);
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
                this._elViewState._display = this.el.style.display;
                // if saved display is none, then don't store it
                if (this._elViewState._display === "none") {
                    this._elViewState._display = null;
                }
                this.el.style.display = "none";
            } else {
                this.el.style.display = (!this._elViewState._display ? "" : this._elViewState._display);
            }
            this.objEvents.raiseProp("isVisible");
        }
    }
    get validationErrors(): IValidationInfo[] {
        return this._elViewState._errors;
    }
    set validationErrors(v: IValidationInfo[]) {
        if (!this.getIsDisposed() && this._elViewState._errors !== v) {
            this._setErrors(this.el, v);
            this.objEvents.raiseProp("validationErrors");
        }
    }
    get dataName(): string {
        return this._el.getAttribute(DATA_ATTR.DATA_NAME);
    }
    get toolTip(): string {
        return this._elViewState.tip;
    }
    set toolTip(v: string) {
        if (this.toolTip !== v) {
            this._elViewState.tip = v;
            addToolTip(this.el, v);
            this.objEvents.raiseProp("toolTip");
        }
    }
    // stores commands for data binding to the HtmlElement's events
    get events(): IPropertyBag {
        if (!this._elViewState._eventBag) {
            if (this.getIsStateDirty()) {
                return _undefined;
            }
            this._elViewState._eventBag = new EventBag((s, a) => {
                this._onEventChanged(a);
            });
        }
        return this._elViewState._eventBag;
    }
    // exposes All HTML Element properties for data binding directly to them
    get props(): IPropertyBag {
        if (!this._elViewState._propBag) {
            if (this.getIsStateDirty()) {
                return _undefined;
            }
            this._elViewState._propBag = new PropertyBag(this.el);
        }
        return this._elViewState._propBag;
    }
    // exposes All CSS Classes for data binding directly to them
    get classes(): IPropertyBag {
        if (!this._elViewState._classBag) {
            if (this.getIsStateDirty()) {
                return _undefined;
            }
            this._elViewState._classBag = new CSSBag(this.el);
        }
        return this._elViewState._classBag;
    }
    get isDelegationOn(): boolean {
        return !!(this._subscribeFlags & (1 << SubscribeFlags.delegationOn));
    }
    get css(): string {
        return this._elViewState.css;
    }
    set css(v: string) {
        const arr: string[] = [];
        if (this.css !== v) {
            if (!!this.css) {
                arr.push("-" + this.css);
            }
            this._elViewState.css = v;
            if (!!this.css) {
                arr.push("+" + this.css);
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
