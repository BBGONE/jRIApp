/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "jriapp/int";
import { BaseElView, PROP_NAME } from "./generic";

export class InputElView extends BaseElView {
    toString() {
        return "InputElView";
    }
    get isEnabled() {
        let el = <HTMLInputElement>this.el;
        return !el.disabled;
    }
    set isEnabled(v: boolean) {
        let el = <HTMLInputElement>this.el;
        if (v !== this.isEnabled) {
            el.disabled = !v;
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get value(): string {
        return this.$el.val();
    }
    set value(v) {
        let x = this.value;
        let str = "" + v;
        v = (v === null) ? "" : str;
        if (x !== v) {
            this.$el.val(v);
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
}