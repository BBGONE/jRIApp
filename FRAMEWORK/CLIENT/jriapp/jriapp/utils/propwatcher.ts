/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    BaseObject, Utils
} from "jriapp_shared";

const coreUtils = Utils.core;

export class PropWatcher extends BaseObject {
    private _objId: string;
    private _objs: BaseObject[];
    constructor() {
        super();
        this._objId = coreUtils.getNewID();
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