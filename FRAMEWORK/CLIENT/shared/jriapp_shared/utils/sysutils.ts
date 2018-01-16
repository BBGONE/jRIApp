/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    ISubmittable, IErrorNotification, IEditable, IPropertyBag, IBaseObject, IValidatable
} from "../int";
import { Checks } from "./checks";
import { StringUtils } from "./strUtils";

const checks = Checks, strUtils = StringUtils, trim = strUtils.fastTrim;

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

export class SysUtils {
    // DUMMY implementations
    static _isBaseObj: (obj: any) => boolean = () => { return false; };
    static isBinding: (obj: any) => boolean = () => { return false; };
    static isPropBag: (obj: any) => boolean = (obj) => {
        return !!obj && obj.isPropertyBag;
    }

    // DUMMY implementations collection
    static isCollection: (obj: any) => boolean = () => { return false; };
    static getItemByProp: (obj: any, prop: string) => any = () => { return null; };
    static isValidationError: (obj: any) => boolean = () => { return false; };

    // System  Helper functions
    static isBaseObj(obj: any): obj is IBaseObject {
        return SysUtils._isBaseObj(obj);
    }
    static isEditable(obj: any): obj is IEditable {
        const isBO = SysUtils._isBaseObj(obj);
        return isBO && checks.isFunc(obj.beginEdit) && checks.isFunc(obj.endEdit) && checks.isFunc(obj.cancelEdit) && checks.isHasProp(obj, "isEditing");
    }
    static isSubmittable(obj: any): obj is ISubmittable {
        const isBO = SysUtils._isBaseObj(obj);
        return isBO && checks.isFunc(obj.submitChanges) && checks.isHasProp(obj, "isCanSubmit");
    }
    static isErrorNotification(obj: any): obj is IErrorNotification {
        if (!obj) {
             return false;
        }
        if (!checks.isFunc(obj.getIErrorNotification)) {
            return false;
        }
        const tmp = obj.getIErrorNotification();
        return !!tmp && checks.isFunc(tmp.getIErrorNotification);
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
        if (!!obj._aspect && SysUtils.isErrorNotification(obj._aspect)) {
            return obj._aspect.getIErrorNotification();
        } else if (SysUtils.isErrorNotification(obj)) {
            return obj.getIErrorNotification();
        }

        return null;
    }
    static getEditable(obj: any): IEditable {
        if (!obj) {
            return null;
        }
        if (!!obj._aspect && SysUtils.isEditable(obj._aspect)) {
            return obj._aspect;
        } else if (SysUtils.isEditable(obj)) {
            return obj;
        }

        return null;
    }
    static getSubmittable(obj: any): ISubmittable {
        if (!obj) {
            return null;
        }
        if (!!obj._aspect && SysUtils.isSubmittable(obj._aspect)) {
            return obj._aspect;
        } else if (SysUtils.isSubmittable(obj)) {
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
        const self = SysUtils;
        if (!prop) {
            return obj;
        }

        if (self.isBaseObj(obj) && obj.getIsStateDirty()) {
            return checks.undefined;
        }

        if (strUtils.startsWith(prop, "[")) {
            if (self.isCollection(obj)) {
                // it is an indexed property like ['someProp']
                prop = strUtils.trimBrackets(prop);
                return self.getItemByProp(obj, prop);
            } else if (checks.isArray(obj)) {
                // it is an indexed property like ['someProp']
                prop = strUtils.trimBrackets(prop);
                return obj[parseInt(prop, 10)];
            } else if (self.isPropBag(obj)) {
                return (<IPropertyBag>obj).getProp(prop);
            }
        }

        return obj[prop];
    }
    static setProp(obj: any, prop: string, val: any): void {
        const self = SysUtils;
        if (!prop) {
            throw new Error("Invalid operation: Empty Property name");
        }

        if (self.isBaseObj(obj) && obj.getIsStateDirty()) {
            return;
        }

        // it is an indexed property, obj must be an Array
        if (strUtils.startsWith(prop, "[")) {
            if (checks.isArray(obj)) {
                // remove brakets from a string like: [index]
                prop = strUtils.trimBrackets(prop);
                obj[parseInt(prop, 10)] = val;
                return;
            } else if (self.isPropBag(obj)) {
                (<IPropertyBag>obj).setProp(prop, val);
                return;
            }
        }

        obj[prop] = val;
    }
    // the object that directly has this property (last object in chain obj1.obj2.lastObj)
    static resolveOwner(root: any, path: string, separator = "."): any {
        const self = SysUtils;
        if (!path) {
            return root;
        }
        const parts = self.getPathParts(path), maxindex = parts.length - 1;
        let res = root;
        for (let i = 0; i < maxindex; i += 1) {
            res = self.getProp(res, parts[i]);
            if (checks.isNt(res)) {
                return res;
            }
        }
        return res;
    }
    static resolvePath(root: any, path: string): any {
        const self = SysUtils;
        return self.resolvePath2(root, self.getPathParts(path));
    }
    static resolvePath2(root: any, srcParts: string[]): any {
        const self = SysUtils;
        if (checks.isNt(root)) {
            return root;
        }

        if (!srcParts || srcParts.length === 0) {
            return root;
        }

        let obj = root;
        for (let i = 0; i < srcParts.length; i += 1) {
            obj = self.getProp(obj, srcParts[i]);
            if (checks.isNt(obj)) {
                return obj;
            }
        }

        return obj;
    }
    static raiseProp(obj: IBaseObject, path: string): void {
        // in case of complex name like: prop1.prop2.prop3
        const sys = SysUtils, parts = sys.getPathParts(path),
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
