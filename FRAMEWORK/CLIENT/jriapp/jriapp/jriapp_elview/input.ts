/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { BaseElView, PROP_NAME } from "./elview";

export class InputElView extends BaseElView {
    toString() {
        return "InputElView";
    }
    get isEnabled() { return !this.$el.prop("disabled"); }
    set isEnabled(v: boolean) {
        v = !!v;
        if (v !== this.isEnabled) {
            this.$el.prop("disabled", !v);
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