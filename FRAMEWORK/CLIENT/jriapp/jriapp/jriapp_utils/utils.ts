/// <reference path="../../thirdparty/jquery.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { ISubmittable, IErrorNotification, IEditable, IPromise } from "../jriapp_core/shared";
import { BaseObject }  from "../jriapp_core/object";
import { CoreUtils } from "./coreutils";
import { DomUtils } from "./dom";
import { AsyncUtils } from "./async";
import { HttpUtils } from "./http";
import { StringUtils } from "./strutils";
import { Checks } from "./checks";
import { ArrayHelper } from "./arrhelper";

export { DomUtils } from "./dom";
export { AsyncUtils } from "./async";
export { HttpUtils } from "./http";
export { LifeTimeScope } from "./lifetime";
export { PropWatcher } from "./propwatcher";
export { WaitQueue, IWaitQueueItem } from "./waitqueue";
export { Debounce, DblClick, DEBUG, ERROR, SysChecks } from "./coreutils";

const checks = Checks, _async = AsyncUtils;

export class Utils {
    static check = checks;
    static str = StringUtils;
    static arr = ArrayHelper;
    static dom = DomUtils;
    static http = HttpUtils;
    static core = CoreUtils;
    static defer = _async;
    static getErrorNotification(obj: any): IErrorNotification {
        if (!obj) {
            return null;
        }
        else if (!!obj._aspect && checks.isErrorNotification(obj._aspect))
            return <IErrorNotification>obj._aspect.getIErrorNotification();
        else if (checks.isErrorNotification(obj))
            return <IErrorNotification>obj.getIErrorNotification();
        
        return null;
    }
    static getEditable(obj: any): IEditable {
        if (!obj) {
            return null;
        }
        else if (!!obj._aspect && checks.isEditable(obj._aspect)) {
            return <IEditable>obj._aspect;
        }
        else if (checks.isEditable(obj)) {
            return <IEditable>obj;
        }

        return null;
    }
    static getSubmittable(obj: any): ISubmittable {
        if (!obj) {
            return null;
        }
        else if (!!obj._aspect && checks.isSubmittable(obj._aspect)) {
            return <ISubmittable>obj._aspect;
        }
        else if (checks.isSubmittable(obj)) {
            return <ISubmittable>obj;
        }
        
        return null;
    }
    static parseJSON(res: string | any): IPromise<any> {
        return _async.delay(() => {
            let parsed: any = null;
            if (checks.isString(res))
                parsed = JSON.parse(res);
            else
                parsed = res;

            return parsed;
        });
    }
}
