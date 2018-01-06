﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { FIELD_TYPE, DATE_CONVERSION, DATA_TYPE } from "../collection/const";
import { IFieldInfo } from "../collection/int";
import { Utils } from "../utils/utils";
import { ERRS } from "../lang";
import { IValueUtils } from "./int";

const utils = Utils, { getTimeZoneOffset, parseBool, getValue, setValue } = utils.core, strUtils = utils.str,
    { undefined, isArray, isDate, isString, isBoolean, isNumber, isNt } = utils.check;

function pad(num: number): string {
    if (num < 10) {
        return "0" + num;
    }
    return "" + num;
}

function dateToString(dt: Date) {
    return ("" + dt.getFullYear()) +
        "-" + pad(dt.getMonth() + 1) +
        "-" + pad(dt.getDate()) +
        "T" + pad(dt.getHours()) +
        ":" + pad(dt.getMinutes()) +
        ":" + pad(dt.getSeconds()) +
        "." + (dt.getMilliseconds() / 1000).toFixed(3).slice(2, 5) + "Z";
}

export const ValueUtils: IValueUtils = {
    valueToDate: function (val: string, dtcnv: DATE_CONVERSION, serverTZ: number): Date {
        if (!val) {
            return null;
        }
        const dt = new Date(val);
        const clientTZ = getTimeZoneOffset();
        // make fix for timezone
        dt.setMinutes(dt.getMinutes() + clientTZ);

        switch (dtcnv) {
            case DATE_CONVERSION.None:
                break;
            case DATE_CONVERSION.ServerLocalToClientLocal:
                dt.setMinutes(dt.getMinutes() + serverTZ); // ServerToUTC
                dt.setMinutes(dt.getMinutes() - clientTZ); // UtcToLocal
                break;
            case DATE_CONVERSION.UtcToClientLocal:
                dt.setMinutes(dt.getMinutes() - clientTZ); // UtcToLocal
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dtcnv", dtcnv));
        }
        return dt;
    },
    dateToValue: function (dt: Date, dtcnv: DATE_CONVERSION, serverTZ: number): string {
        if (dt === null) {
            return null;
        }

        if (!isDate(dt)) {
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dt", dt));
        }

        const clientTZ = getTimeZoneOffset();
        switch (dtcnv) {
            case DATE_CONVERSION.None:
                break;
            case DATE_CONVERSION.ServerLocalToClientLocal:
                dt.setMinutes(dt.getMinutes() + clientTZ); // LocalToUTC
                dt.setMinutes(dt.getMinutes() - serverTZ); // UtcToServer
                break;
            case DATE_CONVERSION.UtcToClientLocal:
                dt.setMinutes(dt.getMinutes() + clientTZ); // LocalToUTC
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dtcnv", dtcnv));
        }

        return dateToString(dt);
    },
    compareVals: function (v1: any, v2: any, dataType: DATA_TYPE): boolean {
        if ((v1 === null && v2 !== null) || (v1 !== null && v2 === null)) {
            return false;
        }
        switch (dataType) {
            case DATA_TYPE.DateTime:
            case DATA_TYPE.Date:
            case DATA_TYPE.Time:
                return (isDate(v1) && isDate(v2)) ? (v1.getTime() === v2.getTime()) : false;
            default:
                return v1 === v2;
        }
    },
    stringifyValue: function (v: any, dtcnv: DATE_CONVERSION, dataType: DATA_TYPE, serverTZ: number): string {
        let res: string = null;

        if (isNt(v)) {
            return res;
        }

        function conv(v: any): string {
            if (isDate(v)) {
                return ValueUtils.dateToValue(v, dtcnv, serverTZ);
            } else if (isArray(v)) {
                return JSON.stringify(v);
            } else if (isString(v)) {
                return v;
            } else {
                return JSON.stringify(v);
            }
        };
        let isOK = false;
        switch (dataType) {
            case DATA_TYPE.None:
                res = conv(v);
                isOK = true;
                break;
            case DATA_TYPE.String:
            case DATA_TYPE.Guid:
                if (isString(v)) {
                    res = v;
                    isOK = true;
                }
                break;
            case DATA_TYPE.Bool:
                if (isBoolean(v)) {
                    res = JSON.stringify(v);
                    isOK = true;
                }
                break;
            case DATA_TYPE.Integer:
            case DATA_TYPE.Decimal:
            case DATA_TYPE.Float:
                if (isNumber(v)) {
                    res = JSON.stringify(v);
                    isOK = true;
                }
                break;
            case DATA_TYPE.DateTime:
            case DATA_TYPE.Date:
            case DATA_TYPE.Time:
                if (isDate(v)) {
                    res = ValueUtils.dateToValue(v, dtcnv, serverTZ);
                    isOK = true;
                }
                break;
            case DATA_TYPE.Binary:
                if (isArray(v)) {
                    res = JSON.stringify(v);
                    isOK = true;
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dataType", dataType));
        }

        if (!isOK) {
            throw new Error(strUtils.format(ERRS.ERR_FIELD_WRONG_TYPE, v, dataType));
        }
        return res;
    },
    parseValue: function (v: string, dataType: DATA_TYPE, dtcnv: DATE_CONVERSION, serverTZ: number) {
        let res: any = null;

        if (v === undefined || v === null) {
            return res;
        }
        switch (dataType) {
            case DATA_TYPE.None:
                res = v;
                break;
            case DATA_TYPE.String:
            case DATA_TYPE.Guid:
                res = v;
                break;
            case DATA_TYPE.Bool:
                res = parseBool(v);
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

export type WalkFieldCB<T> = (fld: IFieldInfo, name: string, parentRes?: T) => T;

export function fn_walkField<T>(fldName: string, fld: IFieldInfo, cb: WalkFieldCB<T>, parentRes?: T): void {
    if (fld.fieldType === FIELD_TYPE.Object) {
        const res = cb(fld, fldName, parentRes);

        // for object fields traverse their nested fields
        if (!!fld.nested && fld.nested.length > 0) {
            let nestedFld: IFieldInfo;
            const len = fld.nested.length;
            for (let i = 0; i < len; i += 1) {
                nestedFld = fld.nested[i];
                if (nestedFld.fieldType === FIELD_TYPE.Object) {
                    fn_walkField(fldName + "." + nestedFld.fieldName, nestedFld, cb, res);
                } else {
                    cb(nestedFld, fldName + "." + nestedFld.fieldName, res);
                }
            }
        }
    } else {
        cb(fld, fldName, parentRes);
    }
}

export const CollUtils = {
    getObjectField: function (name: string, flds: IFieldInfo[]): IFieldInfo {
        const arrFlds = flds.filter((f) => { return f.fieldName === name; });
        if (!arrFlds || arrFlds.length !== 1) {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "arrFlds.length === 1"));
        }
        return arrFlds[0];
    },
    walkField: function <T>(fld: IFieldInfo, fn: WalkFieldCB<T>, parentRes?: T): void {
        fn_walkField<T>(fld.fieldName, fld, fn, parentRes);
    },
    walkFields: function <T>(flds: IFieldInfo[], fn: WalkFieldCB<T>, parentRes?: T): void {
        for (let i = 0; i < flds.length; i += 1) {
            fn_walkField<T>(flds[i].fieldName, flds[i], fn, parentRes);
        }
    },
    getPKFields(fieldInfos: IFieldInfo[]): IFieldInfo[] {
        const pkFlds: IFieldInfo[] = [], len = fieldInfos.length;
        for (let i = 0; i < len; i += 1) {
            const fld = fieldInfos[i];
            if (fld.isPrimaryKey > 0) {
                pkFlds.push(fld);
            }
        }

        return pkFlds.sort((f1, f2) => {
            return f1.isPrimaryKey - f2.isPrimaryKey;
        });
    },
    initVals: function (flds: IFieldInfo[], vals: any): any {
        CollUtils.walkFields(flds, (fld, fullName) => {
            if (fld.fieldType === FIELD_TYPE.Object) {
                setValue(vals, fullName, {});
            } else {
                if (!(fld.fieldType === FIELD_TYPE.Navigation || fld.fieldType === FIELD_TYPE.Calculated)) {
                    setValue(vals, fullName, null);
                }
            }
        });
        return vals;
    },
    copyVals: function (flds: IFieldInfo[], from: any, to: any): any {
        CollUtils.walkFields(flds, (fld, fullName) => {
            if (fld.fieldType === FIELD_TYPE.Object) {
                setValue(to, fullName, {});
            } else {
                if (!(fld.fieldType === FIELD_TYPE.Navigation || fld.fieldType === FIELD_TYPE.Calculated)) {
                    const value = getValue(from, fullName);
                    setValue(to, fullName, value);
                }
            }
        });
        return to;
    },
    objToVals: function (flds: IFieldInfo[], obj: any): any {
        return (!obj) ? CollUtils.initVals(flds, {}) : CollUtils.copyVals(flds, obj, {});
    },
    cloneVals: function (flds: IFieldInfo[], vals: any): any {
        return CollUtils.copyVals(flds, vals, {});
    }
};
