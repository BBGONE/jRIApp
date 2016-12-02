/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    ISubmittable, IErrorNotification, IEditable, IPropertyBag
} from "../int";
import { Checks } from "./checks";
import { StringUtils } from "./strUtils";

const checks = Checks, strUtils = StringUtils;
const PROP_BAG: string = "IPBag", INDEXED_PROP_RX = /(^\w+)\s*\[\s*['"]?\s*([^'"]+)\s*['",]?\s*\]/i;

export class SysUtils {
    //DUMMY implementations
    static isBaseObj: (obj: any) => boolean = (obj) => { return false; };
    static isBinding: (obj: any) => boolean = (obj) => { return false; };
    static isPropBag: (obj: any) => boolean = (obj) => {
        return SysUtils.isBaseObj(obj) && obj.toString() === PROP_BAG;
    };
    
    //DUMMY implementations collection
    static isCollection: (obj: any) => boolean = (obj) => { return false; };
    static getItemByProp: (obj: any, prop: string) => any = (obj, prop) => { return null; };
    static isValidationError: (obj: any) => boolean = (obj) => { return false; };

    //System  Helper functions
    static isEditable(obj: any): obj is IEditable {
        const isBO = SysUtils.isBaseObj(obj);
        return isBO && checks.isFunc(obj.beginEdit) && !!obj.endEdit && !!obj.cancelEdit && Checks.isHasProp(obj, "isEditing");
    }
    static isSubmittable(obj: any): obj is ISubmittable {
        return !!obj && checks.isFunc(obj.submitChanges) && checks.isHasProp(obj, "isCanSubmit");
    }
    static isErrorNotification(obj: any): obj is IErrorNotification {
        if (!obj) return false;
        if (!checks.isFunc(obj.getIErrorNotification))
            return false;
        const tmp = obj.getIErrorNotification();
        return !!tmp && checks.isFunc(tmp.getIErrorNotification);
    }
  
    static getErrorNotification(obj: any): IErrorNotification {
        if (!obj) {
            return null;
        }
        else if (!!obj._aspect && SysUtils.isErrorNotification(obj._aspect))
            return <IErrorNotification>obj._aspect.getIErrorNotification();
        else if (SysUtils.isErrorNotification(obj))
            return <IErrorNotification>obj.getIErrorNotification();

        return null;
    }
    static getEditable(obj: any): IEditable {
        if (!obj) {
            return null;
        }
        else if (!!obj._aspect && SysUtils.isEditable(obj._aspect)) {
            return <IEditable>obj._aspect;
        }
        else if (SysUtils.isEditable(obj)) {
            return <IEditable>obj;
        }

        return null;
    }
    static getSubmittable(obj: any): ISubmittable {
        if (!obj) {
            return null;
        }
        else if (!!obj._aspect && SysUtils.isSubmittable(obj._aspect)) {
            return <ISubmittable>obj._aspect;
        }
        else if (SysUtils.isSubmittable(obj)) {
            return <ISubmittable>obj;
        }

        return null;
    }

    static PROP_BAG_NAME() { return PROP_BAG; }

    static getPathParts(path: string) {
        let parts: string[] = (!path) ? [] : path.split("."), parts2: string[] = [];
        parts.forEach(function (part) {
            let obj: string, index: string;
            let matches = part.match(INDEXED_PROP_RX);
            if (!!matches) {
                obj = matches[1];
                index = matches[2];
                parts2.push(obj);
                parts2.push("[" + index + "]");
            }
            else
                parts2.push(part);
        });

        return parts2;
    }
    static getProp(obj: any, prop: string) {
        const self = SysUtils;
        if (!prop)
            return obj;

        if (self.isBaseObj(obj) && obj.getIsDestroyCalled())
            return checks.undefined;

        if (strUtils.startsWith(prop, "[")) {
            //it is an indexed property like ['someProp']
            prop = strUtils.trimQuotes(strUtils.trimBrackets(prop));

            if (self.isCollection(obj)) {
                return self.getItemByProp(obj, prop);
            }
            else if (checks.isArray(obj)) {
                return obj[parseInt(prop, 10)];
            }
        }

        if (self.isPropBag(obj)) {
            return (<IPropertyBag>obj).getProp(prop);
        }
        else {
            return obj[prop];
        }
    }
    static resolvePath(obj: any, path: string): any {
        const self = SysUtils;
        if (!path)
            return obj;
        let parts = self.getPathParts(path), res = obj, len = parts.length - 1;
        for (let i = 0; i < len; i += 1) {
            res = self.getProp(res, parts[i]);
            if (!res)
                return checks.undefined;
        }
        return self.getProp(res, parts[len]);
    }
    static setProp(obj: any, prop: string, val: any) {
        const self = SysUtils;
        if (!prop)
            throw new Error("Invalid operation: Empty Property name");

        if (self.isBaseObj(obj) && obj.getIsDestroyCalled())
            return;

        //it is an indexed property, obj must be an Array or ComandStore or a simple indexer
        if (strUtils.startsWith(prop, "[")) {
            //remove brakets from a string like: [index]
            prop = strUtils.trimQuotes(strUtils.trimBrackets(prop));

            if (checks.isArray(obj)) {
                obj[parseInt(prop, 10)] = val;
                return;
            }
        }

        if (self.isPropBag(obj)) {
            (<IPropertyBag>obj).setProp(prop, val);
        }
        else {
            obj[prop] = val;
        }
    }
}