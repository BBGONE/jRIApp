/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { css, PROP_NAME } from "./generic";
import { CheckBoxElView } from "./checkbox";

const checks = Utils.check;

export class RadioElView extends CheckBoxElView {
    toString() {
        return "RadioElView";
    }
    get value(): string { return this.$el.val(); }
    set value(v) {
        let strv = checks.isNt(v)? "" : ("" + v);
        if (strv !== this.$el.val()) {
            this.$el.val(strv);
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get name(): string { return this.$el.prop("name"); }
}

bootstrap.registerElView("input:radio", RadioElView);