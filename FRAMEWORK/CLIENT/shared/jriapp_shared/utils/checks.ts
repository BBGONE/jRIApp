/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
   IThenable
} from "./ideferred";

const GUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class Checks {
    static readonly undefined: any = void (0);

    static isHasProp(obj: any, prop: string): boolean {
        return (!obj) ? false : (prop in obj);
    }
    static isNull(a: any): a is void {
        return a === null;
    }
    static isUndefined(a: any): a is void {
        return a === Checks.undefined;
    }
    static isNt(a: any): a is void {
        return (a === null || a === Checks.undefined);
    }
    static isObject(a: any): boolean {
        return (Checks.isNt(a)) ? false : (typeof a === "object");
    }
    static isSimpleObject(a: any): boolean {
        return (!a) ? false : ((typeof a === "object") && Object.prototype === Object.getPrototypeOf(a));
    }
    static isString(a: any): a is string {
        return (Checks.isNt(a)) ? false : ((typeof a === "string") || (typeof a === "object" && a instanceof String));
    }
    static isFunc(a: any): a is Function {
        return (Checks.isNt(a)) ? false : ((typeof a === "function") || (typeof a === "object" && a instanceof Function));
    }
    static isBoolean(a: any): a is boolean {
        return (Checks.isNt(a)) ? false : ((typeof a === "boolean") || (typeof a === "object" && a instanceof Boolean));
    }
    static isDate(a: any): a is Date {
        return (Checks.isNt(a)) ? false : (typeof a === "object" && a instanceof Date);
    }
    static isNumber(a: any): a is Number {
        return (Checks.isNt(a)) ? false : (typeof a === "number" || (typeof a === "object" && a instanceof Number));
    }
    static isNumeric(a: any): a is Number {
        return Checks.isNumber(a) || (Checks.isString(a) && !isNaN(Number(a)));
    }
    static isBoolString(a: any): boolean {
        return (Checks.isNt(a)) ? false : (a === "true" || a === "false");
    }
    static isGuid(a: any): boolean {
        return Checks.isString(a) && GUID_RX.test(a);
    }
    static isArray<T>(a: any): a is Array<T> {
        return (!a) ? false : Array.isArray(a);
    }
    static isThenable(a: any): a is IThenable<any> {
        return (!a) ? false : ((typeof (a) === "object") && Checks.isFunc(a.then));
    }
}
