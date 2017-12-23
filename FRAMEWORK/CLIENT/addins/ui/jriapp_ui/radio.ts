/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { bootstrap } from "jriapp/bootstrap";
import { PROP_NAME } from "./baseview";
import { CheckBoxElView } from "./checkbox";

const checks = Utils.check;

export class RadioElView extends CheckBoxElView {
    toString() {
        return "RadioElView";
    }
    get value(): string { return (<HTMLInputElement>this.el).value; }
    set value(v) {
        const strv = checks.isNt(v) ? "" : ("" + v);
        if (strv !== this.value) {
            (<HTMLInputElement>this.el).value = strv;
            this.objEvents.raiseProp(PROP_NAME.value);
        }
    }
    get name(): string { return (<HTMLInputElement>this.el).name; }
}

bootstrap.registerElView("input:radio", RadioElView);
