/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { bootstrap } from "jriapp/bootstrap";
import { ITextBoxOptions, TKeyPressArgs } from "./textbox";
import { BaseElView, PROP_NAME } from "./baseview";

const dom = DomUtils;

const TXTAREA_EVENTS = {
    keypress: "keypress"
};

export interface ITextAreaOptions extends ITextBoxOptions {
     wrap?: string;
}

export class TextAreaElView extends BaseElView {
    constructor(options: ITextAreaOptions) {
        super(options);
        const self = this;
        if (!!options.wrap) {
            this.wrap = options.wrap;
        }
        dom.events.on(this.el, "change", function (e) {
            e.stopPropagation();
            self.raisePropertyChanged(PROP_NAME.value);
        }, this.uniqueID);

        dom.events.on(this.el, "keypress", function (e) {
            e.stopPropagation();
            const args: TKeyPressArgs = { keyCode: e.which, value: (<any>e.target).value, isCancel: false };
            self.raiseEvent(TXTAREA_EVENTS.keypress, args);
            if (args.isCancel)
                e.preventDefault();
        }, this.uniqueID);

        if (!!options.updateOnKeyUp) {
            dom.events.on(this.el, "keyup", function (e) {
                e.stopPropagation();
                self.raisePropertyChanged(PROP_NAME.value);
            }, this.uniqueID);
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
        return (<HTMLTextAreaElement>this.el).value;
    }
    set value(v) {
        const x = this.value, str = "" + v;
        v = (!v) ? "" : str;
        if (x !== v) {
            (<HTMLTextAreaElement>this.el).value = v;
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get isEnabled() { return !(<HTMLTextAreaElement>this.el).disabled; }
    set isEnabled(v: boolean) {
        v = !v;
        if (v !== !this.isEnabled) {
            (<HTMLTextAreaElement>this.el).disabled = v;
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get wrap() {
        return (<HTMLTextAreaElement>this.el).wrap;
    }
    set wrap(v) {
        let x = this.wrap;
        if (x !== v) {
            (<HTMLTextAreaElement>this.el).wrap = v;
            this.raisePropertyChanged(PROP_NAME.wrap);
        }
    }
}

bootstrap.registerElView("textarea", TextAreaElView);