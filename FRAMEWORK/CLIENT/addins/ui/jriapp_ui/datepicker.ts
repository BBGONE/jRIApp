/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IDatepicker } from "jriapp/int";
import { DATEPICKER_SVC } from "jriapp/const";
import { bootstrap } from "jriapp/bootstrap";
import { TextBoxElView, ITextBoxOptions } from "./textbox";

const boot = bootstrap;

export interface IDatePickerOptions extends ITextBoxOptions {
    datepicker?: any;
}

export class DatePickerElView extends TextBoxElView {
    constructor(el: HTMLInputElement, options: IDatePickerOptions) {
        super(el, options);
        const datepicker = boot.getSvc<IDatepicker>(DATEPICKER_SVC);
        if (!datepicker) {
            throw new Error("IDatepicker service is not registered");
        }
        datepicker.attachTo(el, options.datepicker, (datetext) => {
            el.value = datetext;
            this.objEvents.raiseProp("value");
        });
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const datepicker = boot.getSvc<IDatepicker>(DATEPICKER_SVC);
        if (!datepicker) {
            throw new Error("IDatepicker service is not registered");
        }
        datepicker.detachFrom(this.el);
        super.dispose();
    }
    toString(): string {
        return "DatePickerElView";
    }
}

boot.registerElView("datepicker", DatePickerElView);
