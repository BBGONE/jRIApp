/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseElView, PROP_NAME } from "./baseview";

export class InputElView extends BaseElView {
    toString() {
        return "InputElView";
    }
    get isEnabled() {
        return (<HTMLInputElement>this.el).disabled;
    }
    set isEnabled(v: boolean) {
        v = !v;
        const el = <HTMLInputElement>this.el;
        if (v !== !this.isEnabled) {
            el.disabled = v;
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get value(): string {
        return (<HTMLInputElement>this.el).value;
    }
    set value(v) {
        const x = this.value, str = "" + v;
        v = (!v) ? "" : str;
        if (x !== v) {
            (<HTMLInputElement>this.el).value = v;
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
}
