/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IValidationInfo } from "../int";
import { BaseError } from "../errors";
import { ERRS, STRS } from "../lang";
import { Utils } from "../utils/utils";

const utils = Utils, sys = utils.sys;

sys.isValidationError = (obj: any) => {
    return (!!obj && obj instanceof ValidationError);
};

export class ValidationError extends BaseError {
    private _errors: IValidationInfo[];
    private _item: any;

    constructor(errorInfo: IValidationInfo[], item: any) {
        let message = ERRS.ERR_VALIDATION + "\r\n", i = 0;
        errorInfo.forEach(function (err) {
            if (i > 0)
                message = message + "\r\n";
            if (!!err.fieldName)
                message = message + " " + STRS.TEXT.txtField + ": " + err.fieldName + " -> " + err.errors.join(", ");
            else
                message = message + err.errors.join(", ");
            i += 1;
        });
        super(message);
        this._errors = errorInfo;
        this._item = item;
    }
    get item() {
        return this._item;
    }
    get errors() {
        return this._errors;
    }
}

export class Validations {
    private static _dtRangeToDate(str: string) {
        let dtParts = str.split("-");
        let dt = new Date(parseInt(dtParts[0], 10), parseInt(dtParts[1], 10) - 1, parseInt(dtParts[2], 10));
        return dt;
    }
    static checkNumRange(num: number, range: string) {
        let rangeParts = range.split(",");
        if (!!rangeParts[0]) {
            if (num < parseFloat(rangeParts[0])) {
                throw new Error(utils.str.format(ERRS.ERR_FIELD_RANGE, num, range));
            }
        }
        if (!!rangeParts[1]) {
            if (num > parseFloat(rangeParts[1])) {
                throw new Error(utils.str.format(ERRS.ERR_FIELD_RANGE, num, range));
            }
        }
    }
    static checkDateRange(dt: Date, range: string) {
        let rangeParts = range.split(",");
        if (!!rangeParts[0]) {
            if (dt < Validations._dtRangeToDate(rangeParts[0])) {
                throw new Error(utils.str.format(ERRS.ERR_FIELD_RANGE, dt, range));
            }
        }
        if (!!rangeParts[1]) {
            if (dt > Validations._dtRangeToDate(rangeParts[1])) {
                throw new Error(utils.str.format(ERRS.ERR_FIELD_RANGE, dt, range));
            }
        }
    }
}
