/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, DATE_CONVERSION, DATA_TYPE } from "../collection/const";
import { IFieldInfo } from "../collection/int";
import { Utils } from "../utils/utils";
import { ERRS } from "../lang";
import { IValueUtils } from "./int";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check;

function pad(num: number): string {
    if (num < 10) {
        return "0" + num;
    }
    return "" + num;
}

function dateToString(dt: Date) {
    return ("" + dt.getFullYear()) +
        '-' + pad(dt.getMonth() + 1) +
        '-' + pad(dt.getDate()) +
        'T' + pad(dt.getHours()) +
        ':' + pad(dt.getMinutes()) +
        ':' + pad(dt.getSeconds()) +
        '.' + (dt.getMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
}

export const ValueUtils: IValueUtils = {
    valueToDate: function (val: string, dtcnv: DATE_CONVERSION, serverTZ: number): Date {
        if (!val)
            return null;
        let dt = new Date(val);
        let clientTZ = coreUtils.get_timeZoneOffset();
        //make fix for timezone
        dt.setMinutes(dt.getMinutes() + clientTZ); 

        switch (dtcnv) {
            case DATE_CONVERSION.None:
                break;
            case DATE_CONVERSION.ServerLocalToClientLocal:
                dt.setMinutes(dt.getMinutes() + serverTZ); //ServerToUTC
                dt.setMinutes(dt.getMinutes() - clientTZ); //UtcToLocal
                break;
            case DATE_CONVERSION.UtcToClientLocal:
                dt.setMinutes(dt.getMinutes() - clientTZ); //UtcToLocal
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dtcnv", dtcnv));
        }
        return dt;
    },
    dateToValue: function (dt: Date, dtcnv: DATE_CONVERSION, serverTZ: number): string {
        if (dt === null)
            return null;

        if (!checks.isDate(dt))
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dt", dt));

        let clientTZ = coreUtils.get_timeZoneOffset();
        switch (dtcnv) {
            case DATE_CONVERSION.None:
                break;
            case DATE_CONVERSION.ServerLocalToClientLocal:
                dt.setMinutes(dt.getMinutes() + clientTZ); //LocalToUTC
                dt.setMinutes(dt.getMinutes() - serverTZ); //UtcToServer
                break;
            case DATE_CONVERSION.UtcToClientLocal:
                dt.setMinutes(dt.getMinutes() + clientTZ); //LocalToUTC
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dtcnv", dtcnv));
        }

        return dateToString(dt);
    },
    compareVals: function (v1: any, v2: any, dataType: DATA_TYPE): boolean {
        if ((v1 === null && v2 !== null) || (v1 !== null && v2 === null))
            return false;
        switch (dataType) {
            case DATA_TYPE.DateTime:
            case DATA_TYPE.Date:
            case DATA_TYPE.Time:
                if (checks.isDate(v1) && checks.isDate(v2))
                    return v1.getTime() === v2.getTime();
                else
                    return false;
            default:
                return v1 === v2;
        }
    },
    stringifyValue: function (v: any, dtcnv: DATE_CONVERSION, dataType: DATA_TYPE, serverTZ: number): string {
        let res: string = null;

        if (checks.isNt(v))
            return res;

        function conv(v: any): string {
            if (checks.isDate(v))
                return ValueUtils.dateToValue(v, dtcnv, serverTZ);
            else if (checks.isArray(v))
                return JSON.stringify(v);
            else if (checks.isString(v))
                return v;
            else
                return JSON.stringify(v);
        };
        let isOK = false;
        switch (dataType) {
            case DATA_TYPE.None:
                res = conv(v);
                isOK = true;
                break;
            case DATA_TYPE.String:
            case DATA_TYPE.Guid:
                if (checks.isString(v)) {
                    res = v;
                    isOK = true;
                }
                break;
            case DATA_TYPE.Bool:
                if (checks.isBoolean(v)) {
                    res = JSON.stringify(v);
                    isOK = true;
                }
                break;
            case DATA_TYPE.Integer:
            case DATA_TYPE.Decimal:
            case DATA_TYPE.Float:
                if (checks.isNumber(v)) {
                    res = JSON.stringify(v);
                    isOK = true;
                }
                break;
            case DATA_TYPE.DateTime:
            case DATA_TYPE.Date:
            case DATA_TYPE.Time:
                if (checks.isDate(v)) {
                    res = ValueUtils.dateToValue(v, dtcnv, serverTZ);
                    isOK = true;
                }
                break;
            case DATA_TYPE.Binary:
                if (checks.isArray(v)) {
                    res = JSON.stringify(v);
                    isOK = true;
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dataType", dataType));
        }

        if (!isOK)
            throw new Error(strUtils.format(ERRS.ERR_FIELD_WRONG_TYPE, v, dataType));
        return res;
    },
    parseValue: function (v: string, dataType: DATA_TYPE, dtcnv: DATE_CONVERSION, serverTZ: number) {
        let res: any = null;

        if (v === checks.undefined || v === null)
            return res;
        switch (dataType) {
            case DATA_TYPE.None:
                res = v;
                break;
            case DATA_TYPE.String:
            case DATA_TYPE.Guid:
                res = v;
                break;
            case DATA_TYPE.Bool:
                res = coreUtils.parseBool(v);
                break;
            case DATA_TYPE.Integer:
                res = parseInt(v, 10);
                break;
            case DATA_TYPE.Decimal:
            case DATA_TYPE.Float:
                res = parseFloat(v);
                break;
            case DATA_TYPE.DateTime:
            case DATA_TYPE.Date:
            case DATA_TYPE.Time:
                res = ValueUtils.valueToDate(v, dtcnv, serverTZ);
                break;
            case DATA_TYPE.Binary:
                res = JSON.parse(v);
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dataType", dataType));
        }

        return res;
    }
};

export type TraveseFieldCB<T> = (fld: IFieldInfo, name: string, parent_res?: T) => T;

function _traverseField<T>(fldName: string, fld: IFieldInfo, fn: TraveseFieldCB<T>, parent_res?: T): void {
    if (fld.fieldType === FIELD_TYPE.Object) {
        let res = fn(fld, fldName, parent_res);

        //for object fields traverse their nested fields
        if (!!fld.nested && fld.nested.length > 0) {
            let nestedFld: IFieldInfo, len = fld.nested.length;
            for (let i = 0; i < len; i += 1) {
                nestedFld = fld.nested[i];
                if (nestedFld.fieldType === FIELD_TYPE.Object) {
                    _traverseField(fldName + "." + nestedFld.fieldName, nestedFld, fn, res);
                }
                else {
                    fn(nestedFld, fldName + "." + nestedFld.fieldName, res);
                }
            }
        }
    }
    else {
        fn(fld, fldName, parent_res);
    }
}

export const CollUtils = {
    getObjectField: function (name: string, flds: IFieldInfo[]): IFieldInfo {
        let arrFlds = flds.filter((f) => { return f.fieldName === name; });
        if (!arrFlds || arrFlds.length !== 1)
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "arrFlds.length === 1"));
        return arrFlds[0];
    },
    traverseField: function <T>(fld: IFieldInfo, fn: TraveseFieldCB<T>, parent_res?: T): void {
        _traverseField(fld.fieldName, fld, fn, parent_res);
    },
    traverseFields: function <T>(flds: IFieldInfo[], fn: TraveseFieldCB<T>, parent_res?: T): void {
        for (let i = 0; i < flds.length; i += 1) {
            _traverseField(flds[i].fieldName, flds[i], fn, parent_res);
        }
    },
    initVals: function (flds: IFieldInfo[], vals: any): any {
        CollUtils.traverseFields(flds, (fld, fullName) => {
            if (fld.fieldType === FIELD_TYPE.Object) {
                coreUtils.setValue(vals, fullName, {});
            }
            else {
                if (!(fld.fieldType === FIELD_TYPE.Navigation || fld.fieldType === FIELD_TYPE.Calculated)) {
                    coreUtils.setValue(vals, fullName, null);
                }
            }
        });
        return vals;
    },
    copyVals: function (flds: IFieldInfo[], from: any, to: any): any {
        CollUtils.traverseFields(flds, (fld, fullName) => {
            if (fld.fieldType === FIELD_TYPE.Object) {
                coreUtils.setValue(to, fullName, {});
            }
            else {
                if (!(fld.fieldType === FIELD_TYPE.Navigation || fld.fieldType === FIELD_TYPE.Calculated)) {
                    const value = coreUtils.getValue(from, fullName);
                    coreUtils.setValue(to, fullName, value);
                }
            }
        });
        return to;
    },
    objToVals: function (flds: IFieldInfo[], obj: any): any {
        let vals = CollUtils.initVals(flds, {});
        if (!obj)
            return vals;
        return CollUtils.copyVals(flds, obj, vals);
    },
    cloneVals: function (flds: IFieldInfo[], vals: any): any {
        return CollUtils.copyVals(flds, vals, {});
    }
}