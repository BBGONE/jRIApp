/// <reference path="../jriapp_core/../../thirdparty/jquery.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IBaseObject, IEditable, ISubmittable, IErrorNotification, IThenable, IPropertyBag } from "../jriapp_core/shared";
import { SysChecks } from "./syschecks";

export class Checks {
    static undefined: any = (<any>{})["nonexistent"];

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
    static isBaseObject(a: any): a is IBaseObject {
        return SysChecks._isBaseObj(a);
    }
    static isCollection(a: any): boolean {
        return SysChecks._isCollection(a);
    }
    static isEditable(obj: any): obj is IEditable {
        let isBO = Checks.isBaseObject(obj);
        return isBO && Checks.isFunc(obj.beginEdit) && !!obj.endEdit && !!obj.cancelEdit && Checks.isHasProp(obj, "isEditing");
    }
    static isSubmittable(obj: any): obj is ISubmittable {
        return !!obj && Checks.isFunc(obj.submitChanges) && !!obj.rejectChanges && Checks.isHasProp(obj, "isCanSubmit");
    }
    static isErrorNotification(obj: any): obj is IErrorNotification {
        if (!obj) return false;
        if (!Checks.isFunc(obj.getIErrorNotification))
            return false;
        let tmp = obj.getIErrorNotification();
        return !!tmp && Checks.isFunc(tmp.getIErrorNotification);
    }
    static isThenable(a: any): a is IThenable<any> {
        if (!a) return false;
        return ((typeof (a) === "object") && Checks.isFunc(a.then));
    }
}
