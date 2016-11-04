/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { BaseElView, css, PROP_NAME } from "./elview";

const utils = Utils, $ = utils.dom.$;

export class SpanElView extends BaseElView {
    toString() {
        return "SpanElView";
    }
    get text() { return this.$el.text(); }
    set text(v) {
        let $el = this.$el, x = $el.text();
        let str = "" + v;
        v = v === null ? "" : str;
        if (x !== v) {
            $el.text(v);
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
    get html() { return this.$el.html(); }
    set html(v) {
        let x = this.$el.html();
        let str = "" + v;
        v = v === null ? "" : str;
        if (x !== v) {
            this.$el.html(v);
            this.raisePropertyChanged(PROP_NAME.html);
        }
    }
    get color() {
        let $el = this.$el;
        return $el.css(css.color);
    }
    set color(v) {
        let $el = this.$el;
        let x = $el.css(css.color);
        if (v !== x) {
            $el.css(css.color, v);
            this.raisePropertyChanged(PROP_NAME.color);
        }
    }
    get fontSize() {
        let $el = this.$el;
        return $el.css(css.fontSize);
    }
    set fontSize(v) {
        let $el = this.$el;
        let x = $el.css(css.fontSize);
        if (v !== x) {
            $el.css(css.fontSize, v);
            this.raisePropertyChanged(PROP_NAME.fontSize);
        }
    }
}

bootstrap.registerElView("span", SpanElView);