/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    LocaleERRS, Utils, BaseObject
} from "jriapp_shared";
import { IDatepicker } from "./int";
import { bootstrap } from "./bootstrap";
import { $, JQueryUtils } from "./utils/jquery";


const utils = Utils, coreUtils = utils.core, dom = utils.dom,
    boot = bootstrap, ERRS = LocaleERRS;

const PROP_NAME = {
    dateFormat: "dateFormat",
    datepickerRegion: "datepickerRegion"
};

export class Datepicker extends BaseObject implements IDatepicker {
    private _datepickerRegion: string;
    private _dateFormat: string;

    constructor() {
        super();
        this._dateFormat = null;
        this._datepickerRegion = "";
        if (!(<any>$).datepicker) {
            throw new Error(ERRS.ERR_JQUERY_DATEPICKER_NOTFOUND);
        }
        this.dateFormat = "dd.mm.yy";
    }
    toString() {
        return "Datepicker";
    }
    attachTo($el: any, options?: { dateFormat?: string; }) {
        if (!!options)
            $el.datepicker(options);
        else
            $el.datepicker();
    }
    detachFrom($el: any) {
        JQueryUtils.destroy$Plugin($el, "datepicker");
    }
    parseDate(str: string): Date {
        return this.datePickerFn.parseDate(this.dateFormat, str);
    }
    formatDate(date: Date): string {
        return this.datePickerFn.formatDate(this.dateFormat, date);
    }
    //uses jQuery datepicker format
    get dateFormat(): string {
        if (!this._dateFormat) {
            let regional = this.datePickerFn.regional[this._datepickerRegion];
            return regional.dateFormat;
        }
        else {
            return this._dateFormat;
        }
    }
    set dateFormat(v: string) {
        if (this.dateFormat !== v) {
            this._dateFormat = v;
            let regional = this.datePickerFn.regional[this._datepickerRegion];
            if (!!this._dateFormat) {
                regional.dateFormat = this._dateFormat;
                this.datePickerFn.setDefaults(regional);
            }
            this.raisePropertyChanged(PROP_NAME.dateFormat);
        }
    }
    get datepickerRegion() { return this._datepickerRegion; }
    set datepickerRegion(v) {
        if (!v)
            v = "";
        let oldDateFormat = this.dateFormat;
        if (this._datepickerRegion !== v) {
            let regional = this.datePickerFn.regional[v];
            if (!!regional) {
                this._datepickerRegion = v;
                regional.dateFormat = oldDateFormat;
                this.datePickerFn.setDefaults(regional);
                this.raisePropertyChanged(PROP_NAME.datepickerRegion);
            }
        }
    }
    get datePickerFn() {
        return (<any>$).datepicker;
    }
}

boot.registerSvc("IDatepicker", new Datepicker());