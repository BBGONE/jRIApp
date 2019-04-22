/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BRACKETS } from "../const";
import {
    ISubmittable, IErrorNotification, IEditable, IPropertyBag, IBaseObject, IValidatable, IValidationError
} from "../int";
import { ERRS } from "../lang";
import { ICollection } from "../collection/int";
import { Checks } from "./checks";
import { StringUtils } from "./strUtils";

const { isFunc, isHasProp, isArray, isNt, _undefined } = Checks,
    { startsWith, fastTrim: trim, trimBrackets, format, trimQuotes } = StringUtils;

function dummyIsBaseObj(obj: any): obj is IBaseObject {
    return false;
}

function dummyIsCollection(obj: any): obj is ICollection<any> {
    return false;
}

function dummyIsValidationError(obj: any): obj is IValidationError {
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
    static isValidationError: (obj: any) => obj is IValidationError = dummyIsValidationError;
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
    static getBraceLen(val: string, start: number, brace: BRACKETS): number {
        let i: number, cnt = 0, ch: string, literal: string, test = 0;
        const len = val.length;
        let br1: string, br2: string;

        switch (brace) {
            case BRACKETS.ROUND:
                br1 = "(";
                br2 = ")";
                break;
            case BRACKETS.CURLY:
                br1 = "{";
                br2 = "}";
                break;
            case BRACKETS.SQUARE:
                br1 = "[";
                br2 = "]";
                break;
        }


        for (i = start; i < len; i += 1) {
            ch = val.charAt(i);
            if (!literal) {
                switch (ch) {
                    case "'":
                    case '"':
                        literal = ch;
                        cnt += 1;
                        break;
                    case br1:
                        test += 1;
                        cnt += 1;
                        break;
                    case br2:
                        test -= 1;
                        cnt += 1;
                        if (test === 0) {
                            return cnt;
                        }
                        break;
                    default:
                        if (test > 0) {
                            cnt += 1;
                        }
                        break;
                }
            } else {
                switch (ch) {
                    case "'":
                    case '"':
                        if (literal === ch) {
                            //check for quotes escape 
                            const i1 = i + 1, next = i1 < len ? val.charAt(i1) : null;
                            if (next === ch) {
                                i += 1;
                                cnt += 2;
                            } else {
                                literal = null;
                                cnt += 1;
                            }
                        } else {
                            cnt += 1;
                        }
                        break;
                    default:
                        if (test > 0) {
                            cnt += 1;
                        }
                        break;
                }
            }
        }

        if (test !== 0) {
            throw new Error(format(ERRS.ERR_EXPR_BRACES_INVALID, val));
        }
        return cnt;
    }
    static getPathParts(path: string): string[] {
        if (!path) {
            return [];
        }
        let i: number, start = 0, ch: string, val: string;
        const parts: string[] = [], len = path.length;

        for (i = 0; i < len; i += 1) {
            if (start < 0) {
                start = i;
            }
            ch = path.charAt(i);
            switch (ch) {
                case ".":
                    val = trim(path.substring(start, i));
                    if (!val && parts.length === 0) {
                        throw new Error("Invalid property path: " + path);
                    }
                    if (!!val) {
                        parts.push(val);
                    }
                    start = -1;
                    break;
                case "[":
                    val = trim(path.substring(start, i));
                    if (!!val) {
                        parts.push(val);     
                    }

                    const braceLen = sys.getBraceLen(path, i, BRACKETS.SQUARE);
                    val = trimQuotes(path.substring(i + 1, i + braceLen - 1));
                    if (!val) {
                        throw new Error("Invalid property path: " + path);
                    }
                    parts.push(`[${val}]`);
                    i += (braceLen - 1);
                    start = -1;
                    break;
            }
        }

        if (start > -1 && start < i) {
            val = trim(path.substring(start, i));
            if (!!val) {
                parts.push(val);
            }
        }

        return parts;
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
                // it is an indexed property like [someProp]
                prop = trimBrackets(prop);
                return sys.getItemByProp(obj, prop);
            } else if (isArray(obj)) {
                // it is an indexed property like [someProp]
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