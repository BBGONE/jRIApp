/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { $ } from "jriapp/utils/jquery";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { css, PROP_NAME } from "./generic";
import { InputElView } from "./input";

const TXTBOX_EVENTS = {
    keypress: "keypress"
};

export interface ITextBoxOptions extends IViewOptions {
    updateOnKeyUp?: boolean;
}

export type TKeyPressArgs = { keyCode: number; value: string; isCancel: boolean; };

export class TextBoxElView extends InputElView {
    constructor(options: ITextBoxOptions) {
        super(options);
        let self = this;
        let $el = this.$el;
        $el.on("change." + this.uniqueID, function (e) {
            e.stopPropagation();
            self.raisePropertyChanged(PROP_NAME.value);
        });
        $el.on("keypress." + this.uniqueID, function (e) {
            e.stopPropagation();
            let args: TKeyPressArgs = { keyCode: e.which, value: (<any>e.target).value, isCancel: false };
            self.raiseEvent(TXTBOX_EVENTS.keypress, args);
            if (args.isCancel)
                e.preventDefault();
        });
        if (!!options.updateOnKeyUp) {
            $el.on("keyup." + this.uniqueID, function (e) {
                e.stopPropagation();
                self.raisePropertyChanged(PROP_NAME.value);
            });
        }
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [TXTBOX_EVENTS.keypress].concat(base_events);
    }
    addOnKeyPress(fn: (sender: TextBoxElView, args: TKeyPressArgs) => void, nmspace?: string) {
        this._addHandler(TXTBOX_EVENTS.keypress, fn, nmspace);
    }
    removeOnKeyPress(nmspace?: string) {
        this._removeHandler(TXTBOX_EVENTS.keypress, nmspace);
    }
    toString() {
        return "TextBoxElView";
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
}

bootstrap.registerElView("input:text", TextBoxElView);