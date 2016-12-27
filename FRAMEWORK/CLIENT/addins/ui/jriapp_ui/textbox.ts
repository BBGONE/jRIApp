/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { $ } from "jriapp/utils/jquery";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { css, PROP_NAME } from "./baseview";
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
        const self = this, $el = $(this.el);
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
        const base_events = super._getEventNames();
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
        return this.el.style.color;
    }
    set color(v) {
        const x = this.el.style.color;
        if (v !== x) {
            this.el.style.color = v;
            this.raisePropertyChanged(PROP_NAME.color);
        }
    }
}

bootstrap.registerElView("input:text", TextBoxElView);