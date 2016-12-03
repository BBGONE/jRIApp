/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { $ } from "jriapp/utils/jquery";
import { IDatepicker } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { TextBoxElView, ITextBoxOptions } from "./textbox";

const boot = bootstrap;

const PROP_NAME = {
    dateFormat: "dateFormat",
    datepickerRegion: "datepickerRegion"
};

export interface IDatePickerOptions extends ITextBoxOptions {
    datepicker?: any;
}

export class DatePickerElView extends TextBoxElView {
    constructor(options: IDatePickerOptions) {
        super(options);
        let $el = this.$el;
        boot.defaults.datepicker.attachTo($el, options.datepicker);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let $el = this.$el;
        boot.defaults.datepicker.detachFrom($el);
        super.destroy();
   }
    toString() {
        return "DatePickerElView";
   }
}

boot.registerElView("datepicker", DatePickerElView);