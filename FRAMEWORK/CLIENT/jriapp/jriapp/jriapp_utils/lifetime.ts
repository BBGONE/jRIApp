/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { IBaseObject, ILifeTimeScope } from "../jriapp_core/shared";
import { BaseObject }  from "../jriapp_core/object";
import { ArrayHelper} from "./arrhelper";

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
        ArrayHelper.remove(this._objs, b);
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