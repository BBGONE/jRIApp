/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IEditable } from "../int";
import { BaseObject } from "../object";
import { BasePropBag } from "./basebag";
import { CoreUtils } from "./coreutils";
import { StringUtils } from "./strutils";
import { SysUtils } from "./sysutils";
import { Debounce } from "./debounce";
import { AnyList } from "./anylist";

const core = CoreUtils, strUtils = StringUtils;

//used for accessing json (it parses json into a value and then getProp && setProp can be used to get or set values)
export class JsonBag extends BasePropBag implements IEditable {
    private _json: string = void 0;
    private _jsonChanged: (json: string) => void;
    private _val: any = {};
    private _saveVal: any = null;
    private _debounce: Debounce;

    constructor(json: string, jsonChanged: (json: string) => void) {
        super();
        this._debounce = new Debounce();
        this.resetJson(json);
        this._jsonChanged = jsonChanged;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._debounce.destroy();
        this._jsonChanged = null;
        this._json = void 0;
        this._val = {};
        super.destroy();
    }
    protected onChanged() {
        this._debounce.enqueue(() => {
            if (!!this._jsonChanged) {
                this._jsonChanged(this._json);
            }
        });
    }
    resetJson(json: string = null): void {
        if (this._json !== json) {
            this._json = json;
            this._val = (!json ? {} : JSON.parse(json));
            this.raisePropertyChanged("json");
            this.raisePropertyChanged("val");
        }
    }
    updateJson(): boolean {
        const json: string = JSON.stringify(this._val);
        if (json !== this._json) {
            this._json = json;
            this.onChanged();
            this.raisePropertyChanged("json");
            return true;
        }
        return false;
    }

    //implements IEditable
    beginEdit(): boolean {
        if (!this.isEditing) {
            //clone data
            this._saveVal = JSON.parse(JSON.stringify(this._val));
            return true;
        }
        return false;
    }
    endEdit(): boolean {
        if (this.isEditing) {
            this._saveVal = null;
            this.updateJson();
            return true
        }
        return false;
    }
    cancelEdit(): boolean {
        if (this.isEditing) {
            this._val = this._saveVal;
            this._saveVal = null;
            return true;
        }
        return false;
    }
    get isEditing(): boolean {
        return !!this._saveVal;
    }

    //override
    getProp(name: string): any {
        return core.getValue(this._val, name, '->');
    }
    setProp(name: string, val: any): void {
        const old = core.getValue(this._val, name, '->');
        if (old !== val) {
            core.setValue(this._val, name, val, false, '->');
            this.onBagPropChanged(name);
        }
    }

    get val(): any {
        return this._val;
    }
    get json(): string {
        return this._json;
    }
    toString() {
        return "JsonBag";
    }
}

export class JsonArray extends BaseObject {
    private _owner: JsonBag;
    private _pathToArray: string;
    private _list: AnyList = null;
    private _objId: string;

    constructor(owner: JsonBag, pathToArray: string) {
        super();
        this._objId = core.getNewID("jsn");
        this._owner = owner;
        this._pathToArray = pathToArray;
        this.owner.addOnPropertyChange("val", () => {
            if (!!this._list)
                this._list.setValues(this.getArray());
        }, this._objId);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._owner.removeNSHandlers(this._objId);
        this._list.destroy();
        this._list = null;
        this._owner = null;
        super.destroy();
    }
    protected updateArray(arr: any[]): void {
        core.setValue(this._owner.val, this._pathToArray, arr, false, '->');
        this._owner.updateJson();
    }

    getArray(): any[] {
        if (!this._owner)
            return [];
        const res = core.getValue(this._owner.val, this._pathToArray, '->');
        return (!res) ? [] : res;
    }
    get pathToArray(): string {
        return this._pathToArray;
    }
    get owner(): JsonBag {
        return this._owner;
    }

    get list() {
        if (!!this._owner && !this._list) {
            this._list = new AnyList((vals: any[]) => {
                this.updateArray(vals);
            });
            this._list.setValues(this.getArray());
        }
        return this._list;
    }
}