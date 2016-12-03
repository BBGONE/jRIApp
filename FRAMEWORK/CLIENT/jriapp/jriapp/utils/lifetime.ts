/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
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
    static create() {
        return new LifeTimeScope();
    }
    addObj(b: IBaseObject) {
        if (this._objs.indexOf(b) < 0)
            this._objs.push(b);
    }
    removeObj(b: IBaseObject) {
        utils.arr.remove(this._objs, b);
    }
    getObjs() {
        return this._objs;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._objs.forEach(function (obj) {
            if (!obj.getIsDestroyCalled())
                obj.destroy();
        });
        this._objs = [];
        super.destroy();
    }
    toString() {
        return "LifeTimeScope";
    }
}