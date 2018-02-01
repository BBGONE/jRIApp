/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    ISubmittable, IErrorNotification, IEditable, IPropertyBag, IBaseObject, IValidatable
} from "../int";
import { ICollection } from "../collection/int";
import { Checks } from "./checks";
import { StringUtils } from "./strUtils";

const { isFunc, isHasProp, isArray, isNt, _undefined } = Checks, { startsWith, fastTrim: trim, trimBrackets } = StringUtils;

function getPropParts(prop: string): string[] {
    let i: number, start = 0, ch: string, test = 0, cnt = 0;
    const parts: string[] = [], len = prop.length;
    for (i = 0; i < len; i += 1) {
        if (start < 0) {
            start = i;
        }
        ch = prop.charAt(i);

        if (ch === "[") {
            ++test;
            ++cnt;
            if (start < i) {
                const v = trim(prop.substring(start, i));
                if (!!v) {
                    parts.push(v);
                }
            }
            start = -1;
        } else if (ch === "]") {
            --test;
            if (test !== 0) {
                throw new Error("Invalid Property: " + prop);
            }
            if (start < i) {
                const v = trim(prop.substring(start, i));
                if (!v) {
                    throw new Error("Invalid Property: " + prop);
                }
                parts.push(`[${v}]`);
                start = -1;
            } else {
                throw new Error("Invalid Property: " + prop);
            }
        }
    }

    if (test !== 0) {
        throw new Error("Invalid Property: " + prop);
    }
    if (cnt === 0) {
        parts.push(trim(prop));
    }
    return parts;
}

function dummyIsBaseObj(obj: any): obj is IBaseObject {
    return false;
}

function dummyIsCollection(obj: any): obj is ICollection<any> {
    return false;
}

function isPropBag(obj: any): obj is IPropertyBag {
    return !!obj && obj.isPropertyBag;
}

export class SysUtils {
    // DUMMY implementations
    static isBinding: (obj: any) => boolean = (obj: any) => { return false; };
    static readonly isPropBag: (obj: any) => obj is IPropertyBag = isPropBag;

    // DUMMY implementations collection
    static isCollection: (obj: any) => obj is ICollection<any> = dummyIsCollection;
    static getItemByProp: (obj: any, prop: string) => any = (obj: any, prop: string) => { return null; };
    static isValidationError: (obj: any) => boolean = (obj: any) => { return false; };

    // System  Helper functions
    static isBaseObj: (obj: any) => obj is IBaseObject = dummyIsBaseObj;
    static isEditable(obj: any): obj is IEditable {
        return sys.isBaseObj(obj) && isHasProp(obj, "isEditing") && isFunc((<any>obj).beginEdit) && isFunc((<any>obj).endEdit) && isFunc((<any>obj).cancelEdit);
    }
    static isSubmittable(obj: any): obj is ISubmittable {
        return sys.isBaseObj(obj) && isHasProp(obj, "isCanSubmit") && isFunc((<any>obj).submitChanges);
    }
    static isErrorNotification(obj: any): obj is IErrorNotification {
        if (!obj) {
             return false;
        }
        if (!isFunc(obj.getIErrorNotification)) {
            return false;
        }
        const tmp = obj.getIErrorNotification();
        return !!tmp && isFunc(tmp.getIErrorNotification);
    }
    static isValidatable(obj: any): obj is IValidatable {
        if (!obj) {
            return false;
        }
        return "validationErrors" in obj;
    }
    static getErrorNotification(obj: any): IErrorNotification {
        if (!obj) {
            return null;
        }
        if (!!obj._aspect && sys.isErrorNotification(obj._aspect)) {
            return obj._aspect.getIErrorNotification();
        } else if (sys.isErrorNotification(obj)) {
            return obj.getIErrorNotification();
        }

        return null;
    }
    static getEditable(obj: any): IEditable {
        if (!obj) {
            return null;
        }
        if (!!obj._aspect && sys.isEditable(obj._aspect)) {
            return obj._aspect;
        } else if (sys.isEditable(obj)) {
            return obj;
        }

        return null;
    }
    static getSubmittable(obj: any): ISubmittable {
        if (!obj) {
            return null;
        }
        if (!!obj._aspect && sys.isSubmittable(obj._aspect)) {
            return obj._aspect;
        } else if (sys.isSubmittable(obj)) {
            return obj;
        }

        return null;
    }

    static getPathParts(path: string): string[] {
        const parts: string[] = (!path) ? [] : path.split("."), parts2: string[] = [];
        for (let k = 0, l1 = parts.length; k < l1; k += 1) {
            let part = parts[k];
            // if empty part
            if (!part) {
                throw new Error("Invalid Path: " + path);
            }
            if (part.indexOf("[") < 0) {
                parts2.push(trim(part));
            } else {
                const arr = getPropParts(part);
                for (let i = 0, l2 = arr.length; i < l2; i += 1) {
                    parts2.push(arr[i]);
                }
            }
        }
        return parts2;
    }
    static getProp(obj: any, prop: string): any {
        if (!prop) {
            return obj;
        }

        if (sys.isBaseObj(obj) && obj.getIsStateDirty()) {
            return _undefined;
        }

        if (startsWith(prop, "[")) {
            if (sys.isCollection(obj)) {
                // it is an indexed property like ['someProp']
                prop = trimBrackets(prop);
                return sys.getItemByProp(obj, prop);
            } else if (isArray(obj)) {
                // it is an indexed property like ['someProp']
                prop = trimBrackets(prop);
                return obj[parseInt(prop, 10)];
            } else if (sys.isPropBag(obj)) {
                return obj.getProp(prop);
            }
        }

        return obj[prop];
    }
    static setProp(obj: any, prop: string, val: any): void {
        if (!prop) {
            throw new Error("Invalid operation: Empty Property name");
        }

        if (sys.isBaseObj(obj) && obj.getIsStateDirty()) {
            return;
        }

        // it is an indexed property, obj must be an Array
        if (startsWith(prop, "[")) {
            if (isArray(obj)) {
                // remove brakets from a string like: [index]
                prop = trimBrackets(prop);
                obj[parseInt(prop, 10)] = val;
                return;
            } else if (sys.isPropBag(obj)) {
                (<IPropertyBag>obj).setProp(prop, val);
                return;
            }
        }

        obj[prop] = val;
    }
    // the object that directly has this property (last object in chain obj1.obj2.lastObj)
    static resolveOwner(root: any, path: string, separator = "."): any {
       if (!path) {
            return root;
        }
        const parts = sys.getPathParts(path), maxindex = parts.length - 1;
        let res = root;
        for (let i = 0; i < maxindex; i += 1) {
            res = sys.getProp(res, parts[i]);
            if (isNt(res)) {
                return res;
            }
        }
        return res;
    }
    static resolvePath(root: any, path: string): any {
        return sys.resolvePath2(root, sys.getPathParts(path));
    }
    static resolvePath2(root: any, srcParts: string[]): any {
        if (isNt(root)) {
            return root;
        }

        if (!srcParts || srcParts.length === 0) {
            return root;
        }

        let obj = root;
        for (let i = 0; i < srcParts.length; i += 1) {
            obj = sys.getProp(obj, srcParts[i]);
            if (isNt(obj)) {
                return obj;
            }
        }

        return obj;
    }
    static raiseProp(obj: IBaseObject, path: string): void {
        // in case of complex name like: prop1.prop2.prop3
        const parts = sys.getPathParts(path),
            lastName = parts[parts.length - 1];
        if (parts.length > 1) {
            const owner = sys.resolveOwner(obj, path);
            if (!!sys.isBaseObj(owner)) {
                owner.objEvents.raiseProp(lastName);
            }
        } else {
            obj.objEvents.raiseProp(lastName);
        }
    }
}

const sys = SysUtils;