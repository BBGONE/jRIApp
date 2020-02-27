/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IBaseObject, BaseObject, Utils
} from "jriapp_shared";

const coreUtils = Utils.core;

export class PropWatcher extends BaseObject {
    private _uniqueID: string;
    private _objs: IBaseObject[];
    constructor() {
        super();
        this._uniqueID = coreUtils.getNewID("prw");
        this._objs = [];
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const self = this;
        for (const obj of this._objs)
        {
            self.removeWatch(obj);
        }
        this._objs = [];
        super.dispose();
    }
    static create(): PropWatcher {
        return new PropWatcher();
    }
    addPropWatch(obj: IBaseObject, prop: string, fnOnChange: (prop: string) => void): void {
        const self = this;
        obj.objEvents.onProp(prop, function (_, a) {
            fnOnChange(a.property);
        }, self.uniqueID);

        if (self._objs.indexOf(obj) < 0) {
            self._objs.push(obj);
        }
    }
    addWatch(obj: IBaseObject, props: string[], fnOnChange: (prop: string) => void): void {
        const self = this;
        obj.objEvents.onProp("*", function (_, a) {
            if (props.indexOf(a.property) > -1) {
                fnOnChange(a.property);
            }
        }, self.uniqueID);

        if (self._objs.indexOf(obj) < 0) {
            self._objs.push(obj);
        }
    }
    removeWatch(obj: IBaseObject): void {
        obj.objEvents.offNS(this.uniqueID);
    }
    toString(): string {
        return "PropWatcher " + this._uniqueID;
    }
    get uniqueID(): string {
        return this._uniqueID;
    }
}
