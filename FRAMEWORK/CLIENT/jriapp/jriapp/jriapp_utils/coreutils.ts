/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DEBUG_LEVEL } from "../jriapp_core/const";
import { DebugLevel, IIndexer, DummyError, AbortError } from "../jriapp_core/shared";
import { ArrayHelper } from "./arrhelper";
import { StringUtils } from "./strutils";
import { Checks } from "./checks";

export { Debounce } from "./debounce";
export { DblClick } from "./dblclick";
export { ArrayHelper, IArrayLikeList } from "./arrhelper";
export { StringUtils } from "./strutils";
export { Checks } from "./checks";
export { SysChecks } from "./syschecks";

export class DEBUG {
    static checkStartDebugger() {
        if (DebugLevel === DEBUG_LEVEL.HIGH) {
            debugger;
        }
    }
    static isDebugging() {
        return DebugLevel > DEBUG_LEVEL.NONE;
    }
}

export class ERROR {
    static throwDummy(err: any): void {
        if (ERROR.checkIsDummy(err)) 
            throw err;
        else
            throw new DummyError(err);
    }
    static checkIsDummy(error: any): boolean {
        return !!error && !!error.isDummy;
    }
    static checkIsAbort(error: any): boolean {
        return !!error && (error instanceof AbortError);
    }
    static reThrow(ex: any, isHandled: boolean) {
        if (!isHandled)
            throw ex;
        else
            ERROR.throwDummy(ex);
    }
    static abort(reason?: string) {
        throw new AbortError(reason);
    }
}

export class LOG {
    static log(str: string): void {
        console.log(str);
    }
    static warn(str: string): void {
        console.warn(str);
    }
    static error(str: string): void {
        console.error(str);
    }
}

//essential core utils
export class CoreUtils {
    private static _newID = 0;
    private static ERR_OBJ_ALREADY_REGISTERED = "an Object with the name: {0} is already registered and can not be overwritten";
    private static CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

    static check = Checks;
    static str = StringUtils;
    static arr = ArrayHelper;
    static getNewID(): number {
        let id = CoreUtils._newID;
        CoreUtils._newID += 1;
        return id;
    }
    static get_timeZoneOffset = (function () {
        let dt = new Date();
        let tz = dt.getTimezoneOffset();

        return function () {
            return tz;
        }
    })();
    static hasProp = Checks.isHasProp;
    /*
     *    Usage:     format('test {0}={1}', 'x', 100);
     *    result:    test x=100
    */
    static setValue(root: any, namePath: string, val: any, checkOverwrite: boolean): void {
        let parts = namePath.split("."),
            parent = root,
            i: number;

        for (i = 0; i < parts.length - 1; i += 1) {
            // create a property if it doesn't exist
            if (!parent[parts[i]]) {
                parent[parts[i]] = {};
            }
            parent = parent[parts[i]];
        }
        //the last part is the name itself
        let n = parts[parts.length - 1];
        if (!!checkOverwrite && (parent[n] !== Checks.undefined)) {
            throw new Error(StringUtils.format(CoreUtils.ERR_OBJ_ALREADY_REGISTERED, namePath));
        }
        parent[n] = val;
    }
    static getValue(root: any, namePath: string): any {
        let res: any;
        let parts = namePath.split("."),
            parent = root,
            i: number;

        for (i = 0; i < parts.length; i += 1) {
            res = parent[parts[i]];
            if (res === Checks.undefined) {
                return null;
            }
            parent = res;
        }
        return res;
    }
    static removeValue(root: any, namePath: string): any {
        let parts = namePath.split("."),
            parent = root,
            i: number, val: any = null;

        for (i = 0; i < parts.length - 1; i += 1) {
            if (!parent[parts[i]]) {
                return null;
            }
            parent = parent[parts[i]];
        }
        //the last part is the object name itself
        let n = parts[parts.length - 1];
        val = parent[n];
        if (val !== Checks.undefined) {
            delete parent[n];
        }

        //returns deleted value
        return val;
    }
    //the object that directly has this property (last object in chain obj1.obj2.lastObj)
    static resolveOwner(obj: any, path: string): any {
        let parts = path.split("."), i: number, res: any, len = parts.length;
        if (len === 1)
            return obj;
        res = obj;
        for (i = 0; i < len - 1; i += 1) {
            res = res[parts[i]];
            if (res === Checks.undefined)
                return Checks.undefined;
            if (res === null)
                return null;
        }
        return res;
    }
    static uuid(len?: number, radix?: number): string {
        let i: number, chars = CoreUtils.CHARS, uuid: string[] = [], rnd = Math.random;
        radix = radix || chars.length;

        if (!!len) {
            // Compact form
            for (i = 0; i < len; i += 1) uuid[i] = chars[0 | rnd() * radix];
        } else {
            // rfc4122, version 4 form
            let r: number;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
            uuid[14] = "4";

            // Fill in random data.  At i===19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i += 1) {
                if (!uuid[i]) {
                    r = 0 | rnd() * 16;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r & 0xf];
                }
            }
        }

        return uuid.join("");
    }
    static parseBool(a: any): boolean {
        if (Checks.isBoolean(a))
            return a;
        let v = StringUtils.trim(a).toLowerCase();
        if (v === "false") return false;
        if (v === "true") return true;
        throw new Error(StringUtils.format("parseBool, argument: {0} is not a valid boolean string", a));
    }
    static round(num: number, decimals: number): number {
        return parseFloat(num.toFixed(decimals));
    }
    static merge<S, T>(source: S, target?: T): S | T {
        if (!target) {
            target = <any>{};
        }
        if (!source)
            return target;
        let names = Object.getOwnPropertyNames(source), n: string;
        for (let i = 0, len = names.length; i < len; i += 1) {
            n = names[i];
            (<any>target)[n] = (<any>source)[n];
        }
        return target;
    }
    static clone(obj: any, target?: any): any {
        let res: any, i: number, len: number;
        if (!obj) {
            return obj;
        }

        if (CoreUtils.check.isArray(obj)) {
            len = obj.length;
            res = new Array(len);
            for (i = 0; i < len; i += 1) {
                res[i] = CoreUtils.clone(obj[i], null);
            }
        }
        else if (CoreUtils.check.isSimpleObject(obj)) {
            //clone only simple objects
            res = target || {};
            let p: string, keys = Object.getOwnPropertyNames(obj);
            len = keys.length;
            for (i = 0; i < len; i += 1) {
                p = keys[i];
                res[p] = CoreUtils.clone(obj[p], null);
            }
        }
        else
            return obj;
        return res;
    }
    static iterateIndexer<T>(obj: IIndexer<T>, fn: (name: string, val: T) => void) {
        if (!obj)
            return;
        let names = Object.keys(obj);
        for (let i = 0; i < names.length; i += 1) {
            let name = names[i];
            let val = obj[name];
            fn(name, val);
        }
    }
    static extend<T, U>(defaults: T, current: U): T | U {
        return CoreUtils.merge(current, defaults);
    }
    static memoize<T>(callback: () => T): () => T {
        let value: T;
        return function () {
            if (!!callback) {
                value = callback();
                callback = Checks.undefined;
            }
            return value;
        };
    }
    static forEachProp(obj: any, fn: (name: string) => void) {
        if (!obj)
            return;
        let names = Object.getOwnPropertyNames(obj);
        names.forEach(fn);
    }
    static assignStrings<T extends U, U extends IIndexer<any>>(target: T, source: U): T {
        if (Checks.isNt(target))
            target = <any>{};
        if (!Checks.isSimpleObject(source))
            return target;

        let p: string, keys = Object.keys(source), len = keys.length, tval: any, sval: any;

        for (let i = 0; i < len; i += 1) {
            p = keys[i];
            tval = target[p];
            sval = source[p];
            if (Checks.isSimpleObject(sval)) {
                target[p] = CoreUtils.assignStrings(tval, sval);
            }
            else if (Checks.isString(sval)) {
                target[p] = sval;
            }
        }

        return target;
    }
}