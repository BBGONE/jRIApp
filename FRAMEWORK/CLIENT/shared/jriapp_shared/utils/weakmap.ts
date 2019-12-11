/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IWeakMap, WeakMapConstructor } from "../int";

const _undefined: any = void 0;
let counter = (new Date().getTime()) % 1e9;

export function createWeakMap(): IWeakMap {
    const win: any = window;
    if (!win.WeakMap) {
        win.WeakMap = WeakMap;
    }

    return new (<WeakMapConstructor>win.WeakMap)();
}

class WeakMap implements IWeakMap {
    private _name: string;

    constructor() {
        this._name = "_wm_" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
    }
    set(key: any, value: any): IWeakMap {
        const entry: any[] = key[this._name];
        if (!!entry && entry[0] === key) {
            entry[1] = value;
        } else {
            Object.defineProperty(key, this._name, { value: [key, value], writable: true });
        }
        return this;
    }
    get(key: any): any {
        const entry: any[] = key[this._name];
        return (!entry ? _undefined : (entry[0] === key ? entry[1] : _undefined));
    }
    delete(key: any): boolean {
        const entry: any[] = key[this._name];
        if (!entry) {
             return false;
        }
        const hasValue = (entry[0] === key);
        entry[0] = entry[1] = _undefined;
        return hasValue;
    }
    has(key: any): boolean {
        const entry: any[] = key[this._name];
        if (!entry) {
            return false;
        }
        return (entry[0] === key);
    }
}
