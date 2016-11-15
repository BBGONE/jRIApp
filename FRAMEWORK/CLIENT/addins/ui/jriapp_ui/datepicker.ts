/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IDatepicker } from "jriapp_core/shared";
import { ERRS } from "jriapp_core/lang";
import { DomUtils } from "jriapp_utils/dom";
import { bootstrap } from "jriapp_core/bootstrap";
import { TextBoxElView, ITextBoxOptions } from "./textbox";

const dom = DomUtils, $ = dom.$, boot = bootstrap;

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