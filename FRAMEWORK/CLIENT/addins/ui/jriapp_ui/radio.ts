/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { bootstrap } from "jriapp/bootstrap";
import { CheckBoxElView } from "./checkbox";

const checks = Utils.check;

export class RadioElView extends CheckBoxElView {
    toString(): string {
        return "RadioElView";
    }
    get value(): string {
        return (<HTMLInputElement>this.el).value;
    }
    set value(v: string) {
        const strv = checks.isNt(v) ? "" : ("" + v);
        if (strv !== this.value) {
            (<HTMLInputElement>this.el).value = strv;
            this.objEvents.raiseProp("value");
        }
    }
    get name(): string {
        return (<HTMLInputElement>this.el).name;
    }
}

bootstrap.registerElView("input:radio", RadioElView);
