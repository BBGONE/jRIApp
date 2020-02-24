/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IBaseObject, BaseObject, Utils
} from "jriapp_shared";
import { ILifeTimeScope } from "../int";

const utils = Utils;
/*
LifeTimeScope used to hold references to objects and destroys
them all when LifeTimeScope is destroyed itself
*/
export class LifeTimeScope extends BaseObject implements ILifeTimeScope {
    private _objs: IBaseObject[];

    constructor() {
        super();
        this._objs = [];
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        for (const obj of this._objs)
        {
            if (!obj.getIsStateDirty()) {
                obj.dispose();
            }
        }
        this._objs = [];
        super.dispose();
    }
    addObj(b: IBaseObject): void {
        this._objs.push(b);
    }
    removeObj(b: IBaseObject): void {
        utils.arr.remove(this._objs, b);
    }
    getObjs(): IBaseObject[] {
        return this._objs;
    }
    findAll<TObj extends IBaseObject>(predicate: (obj: IBaseObject) => boolean): TObj[] {
        return <TObj[]>this._objs.filter(predicate);
    }
    findFirst<TObj extends IBaseObject>(predicate: (obj: IBaseObject) => boolean): TObj {
        const arr = this._objs, len = arr.length;
        for (let i = 0; i < len; i += 1) {
            if (predicate(arr[i])) {
                return <TObj>arr[i];
            }
        }
        return null;
    }
    toString(): string {
        return "LifeTimeScope";
    }
}
