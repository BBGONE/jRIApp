﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    LocaleERRS, BaseObject
} from "jriapp_shared";
import { IDatepicker } from "jriapp";
import { JQueryUtils, $ } from "./jquery";


const ERRS = LocaleERRS;

export function createDatepickerSvc(): IDatepicker {
    return new Datepicker();
}

class Datepicker extends BaseObject implements IDatepicker {
    private _datepickerRegion: string;
    private _dateFormat: string;

    constructor() {
        super();
        this._dateFormat = null;
        this._datepickerRegion = "";
        if (!$.datepicker) {
            throw new Error(ERRS.ERR_JQUERY_DATEPICKER_NOTFOUND);
        }
        this.dateFormat = "dd.mm.yy";
    }
    toString() {
        return "Datepicker";
    }
    attachTo(el: any, options?: { dateFormat?: string; }, onSelect?: (dateText?: string) => void) {
        const $el = $(el);
        if (!!options) {
            $el.datepicker(options);
        } else {
            $el.datepicker();
        }

        if (!!onSelect) {
            $el.datepicker("option", "onSelect", (dateText: string) => {
                onSelect(dateText);
            });
        }
    }
    detachFrom(el: any) {
        JQueryUtils.dispose$Plugin($(el), "datepicker");
    }
    parseDate(str: string): Date {
        return this.datePickerFn.parseDate(this.dateFormat, str);
    }
    formatDate(date: Date): string {
        return this.datePickerFn.formatDate(this.dateFormat, date);
    }
    // uses jQuery datepicker format
    get dateFormat(): string {
        if (!this._dateFormat) {
            const regional = this.datePickerFn.regional[this._datepickerRegion];
            return regional.dateFormat;
        } else {
            return this._dateFormat;
        }
    }
    set dateFormat(v: string) {
        if (this.dateFormat !== v) {
            this._dateFormat = v;
            const regional = this.datePickerFn.regional[this._datepickerRegion];
            if (!!this._dateFormat) {
                regional.dateFormat = this._dateFormat;
                this.datePickerFn.setDefaults(regional);
            }
            this.objEvents.raiseProp("dateFormat");
        }
    }
    get datepickerRegion() { return this._datepickerRegion; }
    set datepickerRegion(v) {
        if (!v) {
            v = "";
        }
        const oldDateFormat = this.dateFormat;
        if (this._datepickerRegion !== v) {
            const regional = this.datePickerFn.regional[v];
            if (!!regional) {
                this._datepickerRegion = v;
                regional.dateFormat = oldDateFormat;
                this.datePickerFn.setDefaults(regional);
                this.objEvents.raiseProp("datepickerRegion");
            }
        }
    }
    get datePickerFn() {
        return $.datepicker;
    }
}
