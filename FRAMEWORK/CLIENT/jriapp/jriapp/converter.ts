/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    LocaleERRS, Utils
} from "jriapp_shared";
import { IConverter } from "./int";
import { bootstrap } from "./bootstrap";

const utils = Utils, checks = utils.check, strUtils = utils.str,
    coreUtils = utils.core, boot = bootstrap,
    ERRS = LocaleERRS;

export const NUM_CONV = { None: 0, Integer: 1, Decimal: 2, Float: 3, SmallInt: 4 };

export class BaseConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): any {
        return val;
   }
    convertToTarget(val: any, param: any, dataContext: any): any {
        if (checks.isNt(val))
            return null;
        return val;
   }
};
export let baseConverter = new BaseConverter();

export class DateConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): Date {
        if (!val)
            return null;
        let defaults = bootstrap.defaults, datepicker = defaults.datepicker;
        if (!!datepicker)
            return datepicker.parseDate(val);
        else
            return dateTimeConverter.convertToSource(val, defaults.dateFormat, dataContext);
   }
    convertToTarget(val: any, param: any, dataContext: any): string {
        if (checks.isNt(val))
            return "";
        let defaults = bootstrap.defaults, datepicker = defaults.datepicker;
        if (!!datepicker)
            return datepicker.formatDate(val);
        else
            return dateTimeConverter.convertToTarget(val, defaults.dateFormat, dataContext);
   }
    toString() {
        return "DateConverter";
   }
};
let dateConverter = new DateConverter();

export class DateTimeConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): Date {
        if (!val)
            return null;
        let m = moment(val, param);
        if (!m.isValid()) {
            throw new Error(strUtils.format(ERRS.ERR_CONV_INVALID_DATE, val));
       }
        return m.toDate();
   }
    convertToTarget(val: any, param: any, dataContext: any): string {
        if (checks.isNt(val)) {
            return "";
       }
        let m = moment(val);
        return m.format(param);
   }
    toString() {
        return "DateTimeConverter";
   }
};
let dateTimeConverter = new DateTimeConverter();

export class NumberConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): number {
        if (checks.isNt(val))
            return null;
        let defaults = bootstrap.defaults, dp = defaults.decimalPoint, thousand_sep = defaults.thousandSep, prec = 4;
        let value = val.replace(thousand_sep, "");
        value = value.replace(dp, ".");
        value = strUtils.stripNonNumeric(value);
        if (value === "") {
            return null;
       }
        let num: number = null;
        switch (param) {
            case NUM_CONV.SmallInt:
                num = parseInt(value, 10);
                break;
            case NUM_CONV.Integer:
                num = parseInt(value, 10);
                break;
            case NUM_CONV.Decimal:
                prec = defaults.decPrecision;
                num = coreUtils.round(parseFloat(value), prec);
                break;
            case NUM_CONV.Float:
                num = parseFloat(value);
                break;
            default:
                num = Number(value);
                break;
       }

        if (!checks.isNumber(num)) {
            throw new Error(strUtils.format(ERRS.ERR_CONV_INVALID_NUM, val));
       }
        return num;
   }
    convertToTarget(val: any, param: any, dataContext: any): string {
        if (checks.isNt(val)) {
            return "";
       }
        let defaults = bootstrap.defaults, dp = defaults.decimalPoint, thousand_sep = defaults.thousandSep, prec: number;
        switch (param) {
            case NUM_CONV.Integer:
                prec = 0;
                return strUtils.formatNumber(val, prec, dp, thousand_sep);
            case NUM_CONV.Decimal:
                prec = defaults.decPrecision;
                return strUtils.formatNumber(val, prec, dp, thousand_sep);
            case NUM_CONV.SmallInt:
                prec = 0;
                return strUtils.formatNumber(val, prec, dp, "");
            case NUM_CONV.Float:
                //float number type preserves all number precision
                return strUtils.formatNumber(val, null, dp, thousand_sep);
            default:
                return strUtils.formatNumber(val, null, dp, thousand_sep);
       }
   }
    toString() {
        return "NumberConverter";
   }
};
let numberConverter = new NumberConverter();

export class IntegerConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): number {
        return numberConverter.convertToSource(val, NUM_CONV.Integer, dataContext);
   }
    convertToTarget(val: any, param: any, dataContext: any): string {
        return numberConverter.convertToTarget(val, NUM_CONV.Integer, dataContext);
   }
    toString() {
        return "IntegerConverter";
   }
};
let integerConverter = new IntegerConverter();

export class SmallIntConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): number {
        return numberConverter.convertToSource(val, NUM_CONV.SmallInt, dataContext);
   }
    convertToTarget(val: any, param: any, dataContext: any): string {
        return numberConverter.convertToTarget(val, NUM_CONV.SmallInt, dataContext);
   }
    toString() {
        return "SmallIntConverter";
   }
};
let smallIntConverter = new SmallIntConverter();

export class DecimalConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): number {
        return numberConverter.convertToSource(val, NUM_CONV.Decimal, dataContext);
   }
    convertToTarget(val: any, param: any, dataContext: any): string {
        return numberConverter.convertToTarget(val, NUM_CONV.Decimal, dataContext);
   }
    toString() {
        return "DecimalConverter";
   }
};
let decimalConverter = new DecimalConverter();

export class FloatConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): number {
        return numberConverter.convertToSource(val, NUM_CONV.Float, dataContext);
   }
    convertToTarget(val: any, param: any, dataContext: any): string {
        return numberConverter.convertToTarget(val, NUM_CONV.Float, dataContext);
   }
    toString() {
        return "FloatConverter";
   }
};
let floatConverter = new FloatConverter();

export class NotConverter implements IConverter {
    convertToSource(val: any, param: any, dataContext: any): boolean {
        return !val;
   }
    convertToTarget(val: any, param: any, dataContext: any): boolean {
        return !val;
   }
}

boot.registerConverter("BaseConverter", baseConverter);
boot.registerConverter("dateConverter", dateConverter);
boot.registerConverter("dateTimeConverter", dateTimeConverter);
boot.registerConverter("numberConverter", numberConverter);
boot.registerConverter("integerConverter", integerConverter);
boot.registerConverter("smallIntConverter", smallIntConverter);
boot.registerConverter("decimalConverter", decimalConverter);
boot.registerConverter("floatConverter", floatConverter);
boot.registerConverter("notConverter", new NotConverter());