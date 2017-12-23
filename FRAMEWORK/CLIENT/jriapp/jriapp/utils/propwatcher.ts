/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
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
    addPropWatch(obj: IBaseObject, prop: string, fnOnChange: (prop: string) => void) {
        const self = this;
        obj.objEvents.onProp(prop, function (s, a) {
            fnOnChange(a.property);
        }, self.uniqueID);

        if (self._objs.indexOf(obj) < 0) {
            self._objs.push(obj);
        }
    }
    addWatch(obj: IBaseObject, props: string[], fnOnChange: (prop: string) => void) {
        const self = this;
        obj.objEvents.onProp("*", function (s, a) {
            if (props.indexOf(a.property) > -1) {
                fnOnChange(a.property);
            }
        }, self.uniqueID);

        if (self._objs.indexOf(obj) < 0) {
            self._objs.push(obj);
        }
    }
    removeWatch(obj: IBaseObject) {
        obj.objEvents.offNS(this.uniqueID);
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const self = this;
        this._objs.forEach(function (obj) {
            self.removeWatch(obj);
        });
        this._objs = [];
        super.dispose();
    }
    toString() {
        return "PropWatcher " + this._objId;
    }
    get uniqueID() {
        return this._objId;
    }
}
