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
        this._objs.forEach(function (obj) {
            if (!obj.getIsStateDirty()) {
                obj.dispose();
            }
        });
        this._objs = [];
        super.dispose();
    }
    static create(): LifeTimeScope {
        return new LifeTimeScope();
    }
    addObj(b: IBaseObject): void {
        if (this._objs.indexOf(b) < 0) {
            this._objs.push(b);
        }
    }
    removeObj(b: IBaseObject): void {
        utils.arr.remove(this._objs, b);
    }
    getObjs(): IBaseObject[] {
        return this._objs;
    }
    toString(): string {
        return "LifeTimeScope";
    }
}
