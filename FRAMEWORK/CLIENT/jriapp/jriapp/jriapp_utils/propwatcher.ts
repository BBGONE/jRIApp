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
import { BaseObject }  from "../jriapp_core/object";
import { CoreUtils as coreUtils } from "./coreutils";


export class PropWatcher extends BaseObject {
    private _objId: string;
    private _objs: BaseObject[];
    constructor() {
        super();
        this._objId = "prw" + coreUtils.getNewID();
        this._objs = [];
    }
    static create() {
        return new PropWatcher();
    }
    addPropWatch(obj: BaseObject, prop: string, fn_onChange: (prop: string) => void) {
        let self = this;
        obj.addOnPropertyChange(prop, function (s, a) {
            fn_onChange(a.property);
        }, self.uniqueID);

        if (self._objs.indexOf(obj) < 0)
            self._objs.push(obj);
    }
    addWatch(obj: BaseObject, props: string[], fn_onChange: (prop: string) => void) {
        let self = this;
        obj.addOnPropertyChange("*", function (s, a) {
            if (props.indexOf(a.property) > -1) {
                fn_onChange(a.property);
            }
        }, self.uniqueID);

        if (self._objs.indexOf(obj) < 0)
            self._objs.push(obj);
    }
    removeWatch(obj: BaseObject) {
        obj.removeNSHandlers(this.uniqueID);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let self = this;
        this._objs.forEach(function (obj) {
            self.removeWatch(obj);
        });
        this._objs = [];
        super.destroy();
    }
    toString() {
        return "PropWatcher " + this._objId;
    }
    get uniqueID() {
        return this._objId;
    }
}