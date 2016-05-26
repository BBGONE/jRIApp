/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { BaseElView, css, PROP_NAME } from "./elview";
import { SpanElView } from "./span";

const $ = utils.dom.$;

export class BlockElView extends SpanElView {
    toString() {
        return "BlockElView";
    }
    get borderColor() {
        let $el = this.$el;
        return $el.css("border-top-color");
    }
    set borderColor(v) {
        let $el = this.$el;
        let x = $el.css("border-top-color");
        if (v !== x) {
            $el.css("border-color", v);
            this.raisePropertyChanged(PROP_NAME.borderColor);
        }
    }
    get borderStyle() {
        let $el = this.$el;
        return $el.css("border-top-style");
    }
    set borderStyle(v) {
        let $el = this.$el;
        let x = $el.css("border-top-style");
        if (v !== x) {
            $el.css("border-style", v);
            this.raisePropertyChanged(PROP_NAME.borderStyle);
        }
    }
    get width() {
        let $el = this.$el;
        return $el.width();
    }
    set width(v) {
        let $el = this.$el;
        let x = $el.width();
        if (v !== x) {
            $el.width(v);
            this.raisePropertyChanged(PROP_NAME.width);
        }
    }
    get height() {
        let $el = this.$el;
        return $el.height();
    }
    set height(v) {
        let $el = this.$el;
        let x = $el.height();
        if (v !== x) {
            $el.height(v);
            this.raisePropertyChanged(PROP_NAME.height);
        }
    }
}

bootstrap.registerElView("block", BlockElView);
bootstrap.registerElView("div", BlockElView);
bootstrap.registerElView("section", BlockElView);
