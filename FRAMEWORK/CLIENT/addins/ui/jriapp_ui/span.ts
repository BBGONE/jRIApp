/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { $ } from "jriapp/utils/jquery";
import { bootstrap } from "jriapp/bootstrap";
import { BaseElView, css, PROP_NAME } from "./baseview";

export class SpanElView extends BaseElView {
    toString() {
        return "SpanElView";
    }
    get text() { return this.el.textContent; }
    set text(v) {
        const el = this.el, x = el.textContent, str = "" + v;
        v = (v === null ? "" : str);
        if (x !== v) {
            el.textContent = v;
            this.raisePropertyChanged(PROP_NAME.text);
            this.raisePropertyChanged(PROP_NAME.value);
        }
    }
    get value() {
        return this.text;
    }
    set value(v) {
        this.text = v;
    }
    get html() { return this.el.innerHTML; }
    set html(v) {
        const el = this.el, x = this.el.innerHTML, str = "" + v;
        v = v === null ? "" : str;
        if (x !== v) {
            el.innerHTML = v;
            this.raisePropertyChanged(PROP_NAME.html);
        }
    }
}

bootstrap.registerElView("span", SpanElView);