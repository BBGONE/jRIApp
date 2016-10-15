/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { TOOLTIP_SVC, DATA_ATTR } from "../jriapp_core/const";
import { ITooltipService, IElView, IValidationInfo, IApplication, IViewOptions, IPropertyBag } from "../jriapp_core/shared";
import { ERRS, STRS } from "../jriapp_core/lang";
import { BaseObject }  from "../jriapp_core/object";
import { SysChecks } from "../jriapp_utils/syschecks";
import { bootstrap } from "../jriapp_core/bootstrap";
import { Utils as utils } from "../jriapp_utils/utils";
import { TAction, TCommand, ICommand, Command, TPredicate } from "../jriapp_core/mvvm";
import { IEventStore, EventStore, EVENT_CHANGE_TYPE, IEventChangedArgs } from "../jriapp_utils/eventstore";

export { IEventChangedArgs, IEventStore, EVENT_CHANGE_TYPE };

const coreUtils = utils.core, dom = utils.dom, $ = dom.$, checks = utils.check;

SysChecks._isElView = function (obj: any): boolean {
    return !!obj && obj instanceof BaseElView;
}

export function fn_addToolTip($el: JQuery, tip: string, isError?: boolean, pos?: string) {
    let svc = bootstrap.getSvc<ITooltipService>(TOOLTIP_SVC);
    svc.addToolTip($el, tip, isError, pos);
}

export type PropChangedCommand = TCommand<{ property: string; }, any>;
export const PropChangedCommand: new (fn_action: TAction<{ property: string; }, any>, thisObj?: any, fn_canExecute?: TPredicate<{ property: string; }, any>) => PropChangedCommand = TCommand;

export const css = {
    fieldError: "ria-field-error",
    commandLink: "ria-command-link",
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

// wraps HTMLElement to get or change property using data binding
class PropertyBag extends BaseObject implements IPropertyBag {
    private _$el: JQuery;

    constructor($el: JQuery) {
        super();
        this._$el = $el;
    }
    //override
    _isHasProp(prop: string) {
        let res = false;
        if (this._$el.length > 0) {
            let el = this._$el.get(0);
            res = checks.isHasProp(el, prop);
        }
        return res;
    }
    //implement IPropertyBag
    getProp(name: string): any {
        return this._$el.prop(name);
    }
    setProp(name: string, val: any): void {
        let old = this._$el.prop(name);
        if (old !== val) {
            this._$el.prop(name, val);
            this.raisePropertyChanged(name);
        }
    }
    toString() {
        return "IPropertyBag";
    }
}

// wraps HTMLElement to add or remove classNames using data binding
class CSSBag extends BaseObject implements IPropertyBag {
    private _$el: JQuery;

    constructor($el: JQuery) {
        super();
        this._$el = $el;
    }
    //override
    _isHasProp(prop: string) {
        return true;
    }
   //implement IPropertyBag
    getProp(name: string): any {
        return undefined;
    }
    setProp(name: string, val: any): void {
        if (val === undefined)
            return;

        if (name === "*") {
            if (!val) {
                //remove all classes
                dom.removeClass(this._$el, null);
            }
            else if (checks.isArray(val))
            {
                dom.setClasses(this._$el.toArray(), <string[]>val);
            }
            else if (checks.isString(val)) {
                dom.setClasses(this._$el.toArray(), val.split(" "));
            }
            return;
        }

        //set individual classes
        dom.setClass(this._$el.toArray(), name, !val);
    }
    toString() {
        return "IPropertyBag";
    }
}

export class BaseElView extends BaseObject implements IElView {
    private _objId: string;
    private _$el: JQuery;
    protected _errors: IValidationInfo[];
    protected _toolTip: string;
    protected _app: IApplication;
    private _eventStore: EventStore;
    private _props: IPropertyBag;
    private _classes: IPropertyBag;
    //saves old display before making display: none
    private _display: string;
    private _css: string;

    constructor(options: IViewOptions) {
        super();
        let el = options.el;
        this._app = options.app;
        this._$el = $(el);
        this._toolTip = options.tip;

        //lazily initialized
        this._eventStore = null;
        this._props = null;
        this._classes = null;
        this._display = null;
        this._css = options.css;

        this._objId = "elv" + coreUtils.getNewID();
        this._errors = null;
        if (!!this._css) {
            dom.addClass(this._$el, this._css);
        }
        this._applyToolTip();
        this._app.elViewFactory.store.setElView(el, this);
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
        let $el = this.$el;
        if (isError) {
            $el.addClass(css.fieldError);
        }
        else {
            $el.removeClass(css.fieldError);
        }
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
        this._app.elViewFactory.store.setElView(this.el, null);
        let $el = this._$el;
        $el.off("." + this.uniqueID);
        this.validationErrors = null;
        this.toolTip = null;
        if (!!this._eventStore) {
            this._eventStore.destroy();
            this._eventStore = null;
        }
        if (!!this._props) {
            this._props.destroy();
            this._props = null;
        }
        if (!!this._classes) {
            this._classes.destroy();
            this._classes = null;
        }
        this._display = null;
        this._css = null;
        super.destroy();
    }
    public handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return this._app.handleError(error, source);
        }
        return isHandled;
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
    get app(): IApplication { return this._app; }
    //stores commands for data binding to the HtmlElement's events
    get events(): IEventStore {
        if (!this._eventStore) {
            if (this.getIsDestroyCalled())
                return null;

            this._eventStore = new EventStore((s, a) => {
                this._onEventChanged(a);
            });
        }
        return this._eventStore;
    }
    //exposes All HTML Element properties for data binding directly to them
    get props(): IPropertyBag {
        if (!this._props) {
            if (this.getIsDestroyCalled())
                return undefined;
            this._props = new PropertyBag(this.$el);
        }
        return this._props;
    }
    //exposes All CSS Classes for data binding directly to them
    get classes(): IPropertyBag {
        if (!this._classes) {
            if (this.getIsDestroyCalled())
                return undefined;
            this._classes = new CSSBag(this.$el);
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

            utils.dom.setClasses(this._$el.toArray(), arr);
            this.raisePropertyChanged(PROP_NAME.css);
        }
    }
}

bootstrap.registerElView("generic", BaseElView);