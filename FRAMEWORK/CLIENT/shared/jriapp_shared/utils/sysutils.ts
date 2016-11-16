/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    ISubmittable, IErrorNotification, IEditable, IPromise
} from "../shared";
import { Checks } from "./checks";

const checks = Checks;

const PROP_BAG: string = "IPBag";

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
}