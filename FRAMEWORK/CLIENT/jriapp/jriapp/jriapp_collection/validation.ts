/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { BaseError, IValidationInfo } from "../jriapp_core/shared";
import { ERRS, STRS } from "../jriapp_core/lang";
import { StringUtils as strUtils } from "../jriapp_utils/coreutils";

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
                throw new Error(strUtils.format(ERRS.ERR_FIELD_RANGE, num, range));
            }
        }
        if (!!rangeParts[1]) {
            if (num > parseFloat(rangeParts[1])) {
                throw new Error(strUtils.format(ERRS.ERR_FIELD_RANGE, num, range));
            }
        }
    }
    static checkDateRange(dt: Date, range: string) {
        let rangeParts = range.split(",");
        if (!!rangeParts[0]) {
            if (dt < Validations._dtRangeToDate(rangeParts[0])) {
                throw new Error(strUtils.format(ERRS.ERR_FIELD_RANGE, dt, range));
            }
        }
        if (!!rangeParts[1]) {
            if (dt > Validations._dtRangeToDate(rangeParts[1])) {
                throw new Error(strUtils.format(ERRS.ERR_FIELD_RANGE, dt, range));
            }
        }
    }
}
