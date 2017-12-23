﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseElView, PROP_NAME } from "./baseview";

export class InputElView extends BaseElView {
    toString() {
        return "InputElView";
    }
    get isEnabled() {
        return (<HTMLInputElement | HTMLTextAreaElement>this.el).disabled;
    }
    set isEnabled(v: boolean) {
        v = !v;
        const el = <HTMLInputElement | HTMLTextAreaElement>this.el;
        if (v !== !this.isEnabled) {
            el.disabled = v;
            this.objEvents.raiseProp(PROP_NAME.isEnabled);
        }
    }
    get value(): string {
        return (<HTMLInputElement | HTMLTextAreaElement>this.el).value;
    }
    set value(v) {
        const x = this.value, str = "" + v;
        v = (!v) ? "" : str;
        if (x !== v) {
            (<HTMLInputElement | HTMLTextAreaElement>this.el).value = v;
            this.objEvents.raiseProp(PROP_NAME.value);
        }
    }
}
