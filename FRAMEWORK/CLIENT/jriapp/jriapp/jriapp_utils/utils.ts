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


export class Utils {
    static check = Checks;
    static str = StringUtils;
    static arr = ArrayHelper;
    static dom = DomUtils;
    static http = HttpUtils;
    static core = CoreUtils;
    static defer = AsyncUtils;
    static getErrorNotification(obj: any): IErrorNotification {
        if (!obj)
            return null;
        if (!!obj._aspect && Checks.isErrorNotification(obj._aspect))
            return <IErrorNotification>obj._aspect.getIErrorNotification();
        else if (Checks.isErrorNotification(obj))
            return <IErrorNotification>obj.getIErrorNotification();
        else
            return null;
    }
    static getEditable(obj: any): IEditable {
        if (!obj)
            return null;
        if (!!obj._aspect && Checks.isEditable(obj._aspect)) {
            return <IEditable>obj._aspect;
        }
        else if (Checks.isEditable(obj)) {
            return <IEditable>obj;
        }
        else
            return null;
    }
    static getSubmittable(obj: any): ISubmittable {
        if (!obj)
            return null;
        if (!!obj._aspect && Checks.isSubmittable(obj._aspect)) {
            return <ISubmittable>obj._aspect;
        }
        else if (Checks.isSubmittable(obj)) {
            return <ISubmittable>obj;
        }
        else
            return null;
    }
    static parseJSON(res: string | any): IPromise<any> {
        let defer = Utils.defer.createDeferred<any>();
        setTimeout(() => {
            try {
                let parsed: any = null;
                if (Checks.isString(res))
                    parsed = JSON.parse(res);
                else
                    parsed = res;
                defer.resolve(parsed);
            }
            catch (ex) {
                defer.reject(ex);
            }
        }, 0);

        return defer.promise();
    }
}
