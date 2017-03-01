/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IIndexer } from "../int";
import { StringUtils } from "./strutils";
import { Checks } from "./checks";

const checks: typeof Checks = Checks, strUtils: typeof StringUtils = StringUtils;
const UUID_CHARS: string[] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
const NEWID_MAP: IIndexer<number> = {};

//basic utils
export class CoreUtils {
    private static ERR_OBJ_ALREADY_REGISTERED = "an Object with the name: {0} is already registered and can not be overwritten";

    static getNewID(prefix: string = "*"): string {
        const id = NEWID_MAP[prefix] || 0;
        NEWID_MAP[prefix] = id + 1;
        return (prefix === "*") ? id.toString(36) : (prefix + "_" + id.toString(36));
    }

    static get_timeZoneOffset = (() => {
        const dt = new Date(), tz = dt.getTimezoneOffset();
        return () => tz;
    })();
    static hasProp = checks.isHasProp;
    static setValue(root: any, namePath: string, val: any, checkOverwrite: boolean = false, separator = "."): void {
        const parts: string[] = namePath.split(separator), len = parts.length;
        let parent = root;
        for (let i = 0; i < len - 1; i += 1) {
            // create a property if it doesn't exist
            if (!parent[parts[i]]) {
                parent[parts[i]] = {};
            }
            parent = parent[parts[i]];
        }
        //the last part is the name itself
        const n = parts[len - 1];
        if (!!checkOverwrite && (parent[n] !== checks.undefined)) {
            throw new Error(strUtils.format(CoreUtils.ERR_OBJ_ALREADY_REGISTERED, namePath));
        }
        parent[n] = val;
    }
    static getValue(root: any, namePath: string, separator = "."): any {
        const parts = namePath.split(separator);
        let res: any, parent = root;
        for (let i = 0; i < parts.length; i += 1) {
            res = parent[parts[i]];
            if (res === checks.undefined) {
                return null;
            }
            parent = res;
        }
        return res;
    }
    static removeValue(root: any, namePath: string, separator = "."): any {
        const parts = namePath.split(separator);
        let parent = root;
        for (let i = 0; i < parts.length - 1; i += 1) {
            if (!parent[parts[i]]) {
                return null;
            }
            parent = parent[parts[i]];
        }
        //the last part is the object name itself
        const n = parts[parts.length - 1], val = parent[n];
        if (val !== Checks.undefined) {
            delete parent[n];
        }

        //returns deleted value
        return val;
    }
    //the object that directly has this property (last object in chain obj1.obj2.lastObj)
    static resolveOwner(obj: any, path: string, separator = "."): any {
        const parts = path.split(separator), len = parts.length;
        if (len === 1)
            return obj;
        let res = obj;
        for (let i = 0; i < len - 1; i += 1) {
            res = res[parts[i]];
            if (res === checks.undefined || res === null)
                return res;
        }
        return res;
    }
    static uuid(len?: number, radix?: number): string {
        let i: number, chars = UUID_CHARS, uuid: string[] = [], rnd = Math.random;
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
        if (checks.isBoolean(a))
            return a;
        const v = strUtils.trim(a).toLowerCase();
        if (v === "false") return false;
        if (v === "true")
            return true;
        else
            throw new Error(strUtils.format("parseBool, argument: {0} is not a valid boolean string", a));
    }
    static round(num: number, decimals: number): number {
        return parseFloat(num.toFixed(decimals));
    }
    static clone(obj: any, target?: any): any {
        if (!obj) {
            return obj;
        }

        let res: any;

        if (checks.isArray(obj)) {
            res = [];
            for (let i = 0, len = obj.length; i < len; i += 1) {
                res.push(CoreUtils.clone(obj[i], null));
            }
        }
        else if (checks.isSimpleObject(obj)) {
            //clone only simple objects
            res = target || {};
            const keys = Object.getOwnPropertyNames(obj);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                let p = keys[i];
                res[p] = CoreUtils.clone(obj[p], null);
            }
        }
        else {
           res = obj;
        }

        return res;
    }
    static merge<S, T>(source: S, target?: T): S | T {
        if (!target) {
            target = <any>{};
        }
        if (!source)
            return target;
        return CoreUtils.extend(target, source);
    }
    static extend<T, U>(target: T, ...source: U[]): T | U {
        if (checks.isNt(target)) {
            throw new TypeError('extend: Cannot convert first argument to object');
        }

        var to = Object(target);
        for (var i = 0; i < source.length; i++) {
            let nextSource: IIndexer<any> = source[i];
            if (nextSource === undefined || nextSource === null) {
                continue;
            }

            let keys = Object.keys(Object(nextSource));
            for (let nextIndex = 0, len = keys.length; nextIndex < len; nextIndex++) {
                let nextKey = keys[nextIndex], desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                if (desc !== undefined && desc.enumerable) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
        return to;
    }
    //caches the result of function invocation
    static memoize<T>(callback: () => T): () => T {
        let value: T;
        return () => {
            if (!!callback) {
                value = callback();
                callback = checks.undefined;
            }
            return value;
        };
    }
    static forEachProp<T>(obj: IIndexer<T>, fn: (name: string, val?: T) => void) {
        if (!obj)
            return;
        const names = Object.keys(obj);
        for (let i = 0, len = names.length; i < len; i += 1) {
            fn(names[i], obj[names[i]]);
        }
    }
    static assignStrings<T extends U, U extends IIndexer<any>>(target: T, source: U): T {
        if (checks.isNt(target))
            target = <any>{};
        if (!checks.isSimpleObject(source))
            return target;

        const keys = Object.keys(source);

        for (let i = 0, len = keys.length; i < len; i += 1) {
            let p = keys[i], tval = target[p], sval = source[p];
            if (checks.isSimpleObject(sval)) {
                target[p] = CoreUtils.assignStrings(tval, sval);
            }
            else if (checks.isString(sval)) {
                target[p] = sval;
            }
        }

        return target;
    }
}