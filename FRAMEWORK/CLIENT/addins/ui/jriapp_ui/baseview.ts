/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, BaseObject, IPropertyBag, IValidationInfo, IIndexer, LocaleERRS as ERRS, LocaleSTRS as STRS
} from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { DomUtils } from "jriapp/utils/dom";
import { ViewChecks } from "jriapp/utils/viewchecks";
import { TOOLTIP_SVC, DATA_ATTR } from "jriapp/const";
import { ITooltipService, IElView, IElViewStore,IApplication, IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { TAction, TCommand, ICommand, Command, TPredicate } from "jriapp/mvvm";
import { EventBag, EVENT_CHANGE_TYPE, IEventChangedArgs } from "./utils/eventbag";
import { PropertyBag } from "./utils/propbag";
import { CSSBag } from "./utils/cssbag";
import { createToolTipSvc } from "./utils/tooltip";

export { IEventChangedArgs, EVENT_CHANGE_TYPE };

const utils = Utils, coreUtils = utils.core, dom = DomUtils, checks = utils.check,
    boot = bootstrap, viewChecks = ViewChecks;

viewChecks.isElView = function (obj: any): boolean {
    return !!obj && obj instanceof BaseElView;
};

boot.registerSvc(TOOLTIP_SVC, createToolTipSvc());

export function fn_addToolTip($el: JQuery, tip: string, isError?: boolean, pos?: string) {
    let svc = boot.getSvc<ITooltipService>(TOOLTIP_SVC);
    svc.addToolTip($el, tip, isError, pos);
}

export const css = {
    fieldError: "ria-field-error",
    commandLink: "ria-command-link",
    checkedNull: "ria-checked-null",
    disabled: "disabled",
    opacity: "opacity",
    color: "color",
    fontSize: "font-size"
};

export const PROP_NAME = {
    isVisible: "isVisible",
    validationErrors: "validationErrors",
    toolTip: "toolTip",
    css: "css",
    isEnabled: "isEnabled",
    value: "value",
    command: "command",
    disabled: "disabled",
    commandParam: "commandParam",
    isBusy: "isBusy",
    delay: "delay",
    checked: "checked",
    color: "color",
    wrap: "wrap",
    text: "text",
    html: "html",
    preventDefault: "preventDefault",
    imageSrc: "imageSrc",
    glyph: "glyph",
    href: "href",
    fontSize: "fontSize",
    borderColor: "borderColor",
    borderStyle: "borderStyle",
    width: "width",
    height: "height",
    src: "src",
    click: "click"
};

export class BaseElView extends BaseObject implements IElView {
    private _objId: string;
    private _$el: JQuery;
    protected _errors: IValidationInfo[];
    protected _toolTip: string;
    private _eventStore: EventBag;
    private _props: IPropertyBag;
    private _classes: IPropertyBag;
    //saves old display before making display: none
    private _display: string;
    private _css: string;

    constructor(options: IViewOptions) {
        super();
        const el = options.el;
        this._$el = $(el);
        this._toolTip = options.tip;

        //lazily initialized
        this._eventStore = null;
        this._props = null;
        this._classes = null;
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
    private _getStore(): IElViewStore {
        return boot.getApp().viewFactory.store;
    }
    protected _onEventChanged(args: IEventChangedArgs) {
        switch (args.changeType) {
            case EVENT_CHANGE_TYPE.Added:
                this._onEventAdded(args.name, args.newVal);
                break;
            case EVENT_CHANGE_TYPE.Deleted:
                this._onEventDeleted(args.name, args.oldVal);
                break;
        }
    }
    protected _onEventAdded(name: string, newVal: ICommand) {
        let self = this;
        if (this.getIsDestroyCalled())
            return;
        this.$el.on(name + "." + this.uniqueID, function (e) {
            e.stopPropagation();
            if (!!self._eventStore)
                self._eventStore.trigger(name, e);
        });
    }
    protected _onEventDeleted(name: string, oldVal: ICommand) {
        this.$el.off(name + "." + this.uniqueID);
    }
    protected _applyToolTip() {
        if (!!this._toolTip) {
            this._setToolTip(this.$el, this._toolTip);
        }
    }
    protected _getErrorTipInfo(errors: IValidationInfo[]) {
        let tip = ["<b>", STRS.VALIDATE.errorInfo, "</b>", "<br/>"];
        errors.forEach(function (info) {
            let res = "";
            info.errors.forEach(function (str) {
                res = res + " " + str;
            });
            tip.push(res);
            res = "";
        });
        return tip.join("");
    }
    protected _setFieldError(isError: boolean) {
        dom.setClass([this.el], css.fieldError, !isError);
    }
    protected _updateErrorUI(el: HTMLElement, errors: IValidationInfo[]) {
        if (!el) {
            return;
        }
        let $el = this.$el;
        if (!!errors && errors.length > 0) {
            fn_addToolTip($el, this._getErrorTipInfo(errors), true);
            this._setFieldError(true);
        }
        else {
            this._setToolTip($el, this.toolTip);
            this._setFieldError(false);
        }
    }
    protected _setToolTip($el: JQuery, tip: string, isError?: boolean) {
        fn_addToolTip($el, tip, isError);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._getStore().setElView(this.el, null);
        this._$el.off("." + this.uniqueID);
        this.validationErrors = null;
        this.toolTip = null;
        if (!!this._eventStore) {
            this._eventStore.destroy();
            this._eventStore = null;
        }
        if (!!this._props) {
            this._props.destroy();
            this._props = checks.undefined;
        }
        if (!!this._classes) {
            this._classes.destroy();
            this._classes = checks.undefined;
        }
        this._display = null;
        this._css = null;
        super.destroy();
    }
    toString() {
        return "BaseElView";
    }
    get $el(): JQuery {
        return this._$el;
    }
    get el(): HTMLElement {
        return this._$el[0];
    }
    get uniqueID(): string { return this._objId; }
    get isVisible() {
        let v = this.$el.css("display");
        return !(v === "none");
    }
    set isVisible(v) {
        v = !!v;
        if (v !== this.isVisible) {
            if (!v) {
                this._display = this.$el.css("display");
                //if saved display is none, then don't store it
                if (this._display === "none")
                    this._display = null;
                this.$el.css("display", "none");
            }
            else {
                if (!!this._display)
                    this.$el.css("display", this._display);
                else
                    this.$el.css("display", "");
            }
            this.raisePropertyChanged(PROP_NAME.isVisible);
        }
    }
    get validationErrors(): IValidationInfo[] { return this._errors; }
    set validationErrors(v: IValidationInfo[]) {
        if (v !== this._errors) {
            this._errors = v;
            this.raisePropertyChanged(PROP_NAME.validationErrors);
            this._updateErrorUI(this.el, this._errors);
        }
    }
    get dataName(): string { return this._$el.attr(DATA_ATTR.DATA_NAME); }
    get toolTip(): string { return this._toolTip; }
    set toolTip(v: string) {
        if (this._toolTip !== v) {
            this._toolTip = v;
            this._setToolTip(this.$el, v);
            this.raisePropertyChanged(PROP_NAME.toolTip);
        }
    }
    //stores commands for data binding to the HtmlElement's events
    get events(): IPropertyBag {
        if (!this._eventStore) {
            if (this.getIsDestroyCalled())
                return null;

            this._eventStore = new EventBag((s, a) => {
                this._onEventChanged(a);
            });
        }
        return this._eventStore;
    }
    //exposes All HTML Element properties for data binding directly to them
    get props(): IPropertyBag {
        if (!this._props) {
            if (this.getIsDestroyCalled())
                return checks.undefined;
            this._props = new PropertyBag(this.el);
        }
        return this._props;
    }
    //exposes All CSS Classes for data binding directly to them
    get classes(): IPropertyBag {
        if (!this._classes) {
            if (this.getIsDestroyCalled())
                return checks.undefined;
            this._classes = new CSSBag(this.el);
        }
        return this._classes;
    }
    get css() { return this._css; }
    set css(v: string) {
        let arr: string[] = [];
        if (this._css !== v) {
            if (!!this._css)
                arr.push("-" + this._css);
            this._css = v;
            if (!!this._css)
                arr.push("+" + this._css);

            dom.setClasses(this._$el.toArray(), arr);
            this.raisePropertyChanged(PROP_NAME.css);
        }
    }
    get app(): IApplication {
        return boot.getApp();
    }
}

//it is registered by two names
boot.registerElView("generic", BaseElView);
boot.registerElView("baseview", BaseElView);