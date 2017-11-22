/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
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
        dom.events.on(this.el, "change", (e) => {
            e.stopPropagation();
            self.objEvents.raiseProp(PROP_NAME.value);
        }, this.uniqueID);

        dom.events.on(this.el, "keypress", (e) => {
            e.stopPropagation();
            const args: TKeyPressArgs = { keyCode: e.which, value: (<HTMLTextAreaElement>e.target).value, isCancel: false };
            self.objEvents.raise(TXTAREA_EVENTS.keypress, args);
            if (args.isCancel) {
                e.preventDefault();
            }
        }, this.uniqueID);

        if (!!options.updateOnKeyUp) {
            dom.events.on(this.el, "keyup", (e) => {
                e.stopPropagation();
                self.objEvents.raiseProp(PROP_NAME.value);
            }, this.uniqueID);
        }
    }
    getEventNames() {
        const baseEvents = super.getEventNames();
        return [TXTAREA_EVENTS.keypress].concat(baseEvents);
    }
    addOnKeyPress(fn: (sender: TextAreaElView, args: TKeyPressArgs) => void, nmspace?: string) {
        this.objEvents.on(TXTAREA_EVENTS.keypress, fn, nmspace);
    }
    removeOnKeyPress(nmspace?: string) {
        this.objEvents.off(TXTAREA_EVENTS.keypress, nmspace);
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
            this.objEvents.raiseProp(PROP_NAME.value);
        }
    }
    get isEnabled() { return !(<HTMLTextAreaElement>this.el).disabled; }
    set isEnabled(v: boolean) {
        v = !v;
        if (v !== !this.isEnabled) {
            (<HTMLTextAreaElement>this.el).disabled = v;
            this.objEvents.raiseProp(PROP_NAME.isEnabled);
        }
    }
    get wrap() {
        return (<HTMLTextAreaElement>this.el).wrap;
    }
    set wrap(v) {
        const x = this.wrap;
        if (x !== v) {
            (<HTMLTextAreaElement>this.el).wrap = v;
            this.objEvents.raiseProp(PROP_NAME.wrap);
        }
    }
}

bootstrap.registerElView("textarea", TextAreaElView);
