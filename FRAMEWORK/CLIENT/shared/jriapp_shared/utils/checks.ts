/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IBaseObject, IEditable, ISubmittable, IErrorNotification,
    IThenable, IPropertyBag
} from "../shared";

export class Checks {
    static readonly undefined: any = void (0);

    static isHasProp(obj: any, prop: string): boolean {
        if (!obj)
            return false;
        return prop in obj;
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
        if (Checks.isNt(a)) return false;
        return (typeof a === "object");
    }
    static isSimpleObject(a: any): boolean {
        if (!a) return false;
        return ((typeof a === "object") && Object.prototype === Object.getPrototypeOf(a));
    }
    static isString(a: any): a is string {
        if (Checks.isNt(a)) return false;
        return (typeof a === "string") || (typeof a === "object" && a instanceof String);
    }
    static isFunc(a: any): a is Function {
        if (Checks.isNt(a)) return false;
        return (typeof a === "function") || (typeof a === "object" && a instanceof Function);
    }
    static isBoolean(a: any): a is boolean {
        if (Checks.isNt(a)) return false;
        return (typeof a === "boolean") || (typeof a === "object" && a instanceof Boolean);
    }
    static isDate(a: any): a is Date {
        if (Checks.isNt(a)) return false;
        return (typeof a === "object" && a instanceof Date);
    }
    static isNumber(a: any): a is Number {
        if (Checks.isNt(a)) return false;
        return typeof a === "number" || (typeof a === "object" && a instanceof Number);
    }
    static isNumeric(a: any): a is Number {
        return Checks.isNumber(a) || (Checks.isString(a) && !isNaN(Number(a)));
    }
    static isBoolString(a: any): boolean {
        if (Checks.isNt(a)) return false;
        return (a === "true" || a === "false");
    }
    static isArray<T>(a: any): a is Array<T> {
        if (!a) return false;
        return Array.isArray(a);
    }
    static isThenable(a: any): a is IThenable<any> {
        if (!a) return false;
        return ((typeof (a) === "object") && Checks.isFunc(a.then));
    }
}
