/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { $ } from "./utils/jquery";
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
        let datepicker = boot.getSvc<IDatepicker>("IDatepicker");
        if (!datepicker)
            throw new Error("IDatepicker service is not registered");
        datepicker.attachTo(this.el, options.datepicker, () => {
            this.raisePropertyChanged("value");
        });
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let datepicker = boot.getSvc<IDatepicker>("IDatepicker");
        if (!datepicker)
            throw new Error("IDatepicker service is not registered");
        datepicker.detachFrom(this.el);
        super.destroy();
    }
    toString() {
        return "DatePickerElView";
    }
}

boot.registerElView("datepicker", DatePickerElView);