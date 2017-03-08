/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IDatepicker } from "jriapp/int";
import { DATEPICKER_SVC } from "jriapp/const";
import { bootstrap } from "jriapp/bootstrap";
import { TextBoxElView, ITextBoxOptions } from "./textbox";

const boot = bootstrap;

export interface IDatePickerOptions extends ITextBoxOptions {
    datepicker?: any;
}

export class DatePickerElView extends TextBoxElView {
    constructor(options: IDatePickerOptions) {
        super(options);
        const datepicker = boot.getSvc<IDatepicker>(DATEPICKER_SVC);
        if (!datepicker) {
            throw new Error("IDatepicker service is not registered");
        }
        datepicker.attachTo(this.el, options.datepicker, () => {
            this.raisePropertyChanged("value");
        });
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        const datepicker = boot.getSvc<IDatepicker>(DATEPICKER_SVC);
        if (!datepicker) {
            throw new Error("IDatepicker service is not registered");
        }
        datepicker.detachFrom(this.el);
        super.destroy();
    }
    toString() {
        return "DatePickerElView";
    }
}

boot.registerElView("datepicker", DatePickerElView);
