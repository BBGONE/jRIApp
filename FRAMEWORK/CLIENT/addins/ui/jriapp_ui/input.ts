/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseElView } from "./baseview";

export class InputElView extends BaseElView {
    toString(): string {
        return "InputElView";
    }
    get isEnabled(): boolean {
        return (<HTMLInputElement | HTMLTextAreaElement>this.el).disabled;
    }
    set isEnabled(v: boolean) {
        v = !v;
        const el = <HTMLInputElement | HTMLTextAreaElement>this.el;
        if (v !== !this.isEnabled) {
            el.disabled = v;
            this.objEvents.raiseProp("isEnabled");
        }
    }
    get value(): string {
        return (<HTMLInputElement | HTMLTextAreaElement>this.el).value;
    }
    set value(v: string) {
        const x = this.value, str = "" + v;
        v = (!v) ? "" : str;
        if (x !== v) {
            (<HTMLInputElement | HTMLTextAreaElement>this.el).value = v;
            this.objEvents.raiseProp("value");
        }
    }
}
