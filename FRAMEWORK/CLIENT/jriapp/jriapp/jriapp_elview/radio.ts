/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME } from "./elview";
import { CheckBoxElView } from "./checkbox";

const dom = utils.dom, $ = dom.$;

export class RadioElView extends CheckBoxElView {
    toString() {
        return "RadioElView";
    }
    get value(): string { return this.$el.val(); }
    set value(v) {
        let strv = utils.core.check.isNt(v)? "" : ("" + v);
        if (strv !== this.$el.val()) {
            this.$el.val(strv);
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get name(): string { return this.$el.prop("name"); }
}

bootstrap.registerElView("input:radio", RadioElView);