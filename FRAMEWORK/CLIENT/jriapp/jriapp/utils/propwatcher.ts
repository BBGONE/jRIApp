/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IBaseObject, BaseObject, Utils
} from "jriapp_shared";

const coreUtils = Utils.core;

export class PropWatcher extends BaseObject {
    private _objId: string;
    private _objs: IBaseObject[];
    constructor() {
        super();
        this._objId = coreUtils.getNewID("prw");
        this._objs = [];
    }
    static create() {
        return new PropWatcher();
    }
    addPropWatch(obj: IBaseObject, prop: string, fn_onChange: (prop: string) => void) {
        const self = this;
        obj.addOnPropertyChange(prop, function (s, a) {
            fn_onChange(a.property);
        }, self.uniqueID);

        if (self._objs.indexOf(obj) < 0)
            self._objs.push(obj);
    }
    addWatch(obj: IBaseObject, props: string[], fn_onChange: (prop: string) => void) {
        const self = this;
        obj.addOnPropertyChange("*", function (s, a) {
            if (props.indexOf(a.property) > -1) {
                fn_onChange(a.property);
            }
        }, self.uniqueID);

        if (self._objs.indexOf(obj) < 0)
            self._objs.push(obj);
    }
    removeWatch(obj: IBaseObject) {
        obj.removeNSHandlers(this.uniqueID);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        const self = this;
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