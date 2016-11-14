/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "jriapp_core/shared";
import { Utils } from "jriapp_utils/utils";
import { bootstrap } from "jriapp_core/bootstrap";
import { ITextBoxOptions, TKeyPressArgs } from "./textbox";
import { BaseElView, PROP_NAME } from "./generic";

const utils = Utils, $ = utils.dom.$;
const TXTAREA_EVENTS = {
    keypress: "keypress"
};

export interface ITextAreaOptions extends ITextBoxOptions {
     wrap?: string;
}

export class TextAreaElView extends BaseElView {
    constructor(options: ITextAreaOptions) {
        super(options);
        let self = this;
        if (!!options.wrap) {
            this.wrap = options.wrap;
        }
        let $el = this.$el;
        $el.on("change." + this.uniqueID, function (e) {
            e.stopPropagation();
            self.raisePropertyChanged(PROP_NAME.value);
        });
        $el.on("keypress." + this.uniqueID, function (e) {
            e.stopPropagation();
            let args: TKeyPressArgs = { keyCode: e.which, value: (<any>e.target).value, isCancel: false };
            self.raiseEvent(TXTAREA_EVENTS.keypress, args);
            if (args.isCancel)
                e.preventDefault();
        });
        if (!!options.updateOnKeyUp) {
            $el.on("keyup." + this.uniqueID, function (e) {
                e.stopPropagation();
                self.raisePropertyChanged(PROP_NAME.value);
            });
        }
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [TXTAREA_EVENTS.keypress].concat(base_events);
    }
    addOnKeyPress(fn: (sender: TextAreaElView, args: TKeyPressArgs) => void, nmspace?: string) {
        this._addHandler(TXTAREA_EVENTS.keypress, fn, nmspace);
    }
    removeOnKeyPress(nmspace?: string) {
        this._removeHandler(TXTAREA_EVENTS.keypress, nmspace);
    }
    toString() {
        return "TextAreaElView";
    }
    get value(): string {
        return this.$el.val();
    }
    set value(v) {
        let x = this.$el.val();
        let str = "" + v;
        v = (v === null) ? "" : str;
        if (x !== v) {
            this.$el.val(v);
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get isEnabled() { return !this.$el.prop("disabled"); }
    set isEnabled(v: boolean) {
        v = !!v;
        if (v !== this.isEnabled) {
            this.$el.prop("disabled", !v);
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get wrap() {
        return this.$el.prop("wrap");
    }
    set wrap(v) {
        let x = this.wrap;
        if (x !== v) {
            this.$el.prop("wrap", v);
            this.raisePropertyChanged(PROP_NAME.wrap);
        }
    }
}

bootstrap.registerElView("textarea", TextAreaElView);