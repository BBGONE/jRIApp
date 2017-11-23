/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    ISubmittable, IErrorNotification, IEditable, IPropertyBag
} from "../int";
import { Checks } from "./checks";
import { StringUtils } from "./strUtils";

const checks = Checks, strUtils = StringUtils;
const INDEX_PROP_RX = /(\b\w+\b)?\s*(\[.*?\])/gi, trimQuotsRX = /^(['"])+|(['"])+$/g,
    trimBracketsRX = /^(\[)+|(\])+$/g, trimSpaceRX = /^\s+|\s+$/g, allTrims = [trimBracketsRX, trimSpaceRX, trimQuotsRX, trimSpaceRX];

export class SysUtils {
    // DUMMY implementations
    static isBaseObj: (obj: any) => boolean = () => { return false; };
    static isBinding: (obj: any) => boolean = () => { return false; };
    static isPropBag: (obj: any) => boolean = (obj) => {
        return !!obj && obj.isPropertyBag;
    }

    // DUMMY implementations collection
    static isCollection: (obj: any) => boolean = () => { return false; };
    static getItemByProp: (obj: any, prop: string) => any = () => { return null; };
    static isValidationError: (obj: any) => boolean = () => { return false; };

    // System  Helper functions
    static isEditable(obj: any): obj is IEditable {
        const isBO = SysUtils.isBaseObj(obj);
        return isBO && checks.isFunc(obj.beginEdit) && !!obj.endEdit && !!obj.cancelEdit && Checks.isHasProp(obj, "isEditing");
    }
    static isSubmittable(obj: any): obj is ISubmittable {
        return !!obj && checks.isFunc(obj.submitChanges) && checks.isHasProp(obj, "isCanSubmit");
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
    static getErrorNotification(obj: any): IErrorNotification {
        if (!obj) {
            return null;
        } else if (!!obj._aspect && SysUtils.isErrorNotification(obj._aspect)) {
            return <IErrorNotification>obj._aspect.getIErrorNotification();
        } else if (SysUtils.isErrorNotification(obj)) {
            return <IErrorNotification>obj.getIErrorNotification();
        }

        return null;
    }
    static getEditable(obj: any): IEditable {
        if (!obj) {
            return null;
        } else if (!!obj._aspect && SysUtils.isEditable(obj._aspect)) {
            return <IEditable>obj._aspect;
        } else if (SysUtils.isEditable(obj)) {
            return <IEditable>obj;
        }

        return null;
    }
    static getSubmittable(obj: any): ISubmittable {
        if (!obj) {
            return null;
        } else if (!!obj._aspect && SysUtils.isSubmittable(obj._aspect)) {
            return <ISubmittable>obj._aspect;
        } else if (SysUtils.isSubmittable(obj)) {
            return <ISubmittable>obj;
        }

        return null;
    }

    static getPathParts(path: string) {
        const parts: string[] = (!path) ? [] : path.split("."), parts2: string[] = [];

        parts.forEach(function (part) {
            part = part.trim();
            // if empty part
            if (!part) {
                throw new Error("Invalid path: " + path);
            }

            let obj: string = null, matches: any[] = INDEX_PROP_RX.exec(part);
            if (!!matches) {
                while (!!matches) {
                    if (!!matches[1]) {
                        // if more than one object
                        if (!!obj) {
                            throw new Error("Invalid path: " + path);
                        }

                        obj = matches[1].trim();
                        if (!!obj) {
                            parts2.push(obj);
                        }
                    }

                    let val = matches[2];
                    if (!!val) {
                        for (let i = 0; i < allTrims.length; i += 1) {
                            val = val.replace(allTrims[i], "");
                        }
                        if (!!val) {
                            parts2.push("[" + val + "]");
                        }
                    }

                    matches = INDEX_PROP_RX.exec(part);
                }
            } else {
                parts2.push(part);
            }
        });

        return parts2;
    }
    static getProp(obj: any, prop: string) {
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
    static setProp(obj: any, prop: string, val: any) {
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
    static resolvePath(obj: any, path: string): any {
        const self = SysUtils;
        if (!path) {
            return obj;
        }
        const parts = self.getPathParts(path), maxindex = parts.length - 1;
        let res = obj;
        for (let i = 0; i < maxindex; i += 1) {
            res = self.getProp(res, parts[i]);
            if (!res) {
                return checks.undefined;
            }
        }
        return self.getProp(res, parts[maxindex]);
    }
}
