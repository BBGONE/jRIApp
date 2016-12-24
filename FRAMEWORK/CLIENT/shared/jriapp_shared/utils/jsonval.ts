/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IPropertyBag, IEditable } from "../int";
import { BaseObject } from "../object";
import { CoreUtils } from "./coreutils";
import { SysUtils } from "./sysutils";
import { COLL_CHANGE_TYPE } from "../collection/const";
import { ICollChangedArgs, ICollectionItem } from "../collection/int";
import { CollectionItem } from "../collection/item";
import { IListItem, ListItemAspect, BaseList } from "../collection/list";

const core = CoreUtils, PROP_BAG = SysUtils.PROP_BAG_NAME();

//used for accessing json (it parses json into a value and then getProp && setProp can be used to get or set values)
export class JsonBag extends BaseObject implements IPropertyBag, IEditable {
    private _json: string = void 0;
    private _jsonChanged: (json: string) => void;
    private _val: any = {};
    private _saveVal: any = null;

    constructor(json: string, jsonChanged: (json: string) => void) {
        super();
        this.setJson(json);
        this._jsonChanged = jsonChanged;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._jsonChanged = null;
        this._json = void 0;
        this._val = {};
        super.destroy();
    }
    protected onChanged() {
        if (!!this._jsonChanged) {
            this._jsonChanged(this._json);
        }
    }
    setJson(json: string): void {
        if (json === void 0)
            json = null;
        if (this._json !== json) {
            this._json = json;
            this._val = (!json ? {} : JSON.parse(json));
        }
    }
    protected _checkChanges() {
        const json: string = JSON.stringify(this._val);
        if (json !== this._json) {
            this._json = json;
            this.onChanged();
        }
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
            this._checkChanges();
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
    _isHasProp(prop: string) {
        return true;
    }

    //implements IPropertyBag
    getProp(name: string): any {
        return core.getValue(this._val, name, '->');
    }
    setProp(name: string, val: any): void {
        const old = core.getValue(this._val, name, '->');
        if (old !== val) {
            core.setValue(this._val, name, val, false, '->');
            this.raisePropertyChanged(name);
        }
    }

    protected get val() {
        return this._val;
    }

    toString() {
        //This is a special name. Any PropertyBag implementation should return it.
        //then property  value resolution will use getProp && setProp methods
        return PROP_BAG;
    }
}

export interface IAnyVal {
    val: any;
}

export class AnyValListItem extends CollectionItem<ListItemAspect<AnyValListItem, IAnyVal>> implements IListItem, IPropertyBag, IAnyVal {
    constructor(aspect: ListItemAspect<AnyValListItem, IAnyVal>) {
        super(aspect);
        
    }
    get val(): any { return <any>this._aspect._getProp('val'); }
    set val(v: any) { this._aspect._setProp('val', v); }

    //implements IPropertyBag
    getProp(name: string): any {
        return core.getValue(this.val, name, '->');
    }
    setProp(name: string, val: any): void {
        const old = core.getValue(this.val, name, '->');
        if (old !== val) {
            core.setValue(this.val, name, val, false, '->');
            this.raisePropertyChanged(name);
        }
    }
    get list(): AnyList {
        return <AnyList>this._aspect.list;
    }
    toString() {
        //This is a special name. Any PropertyBag implementation should return it.
        //then property  value resolution will use getProp && setProp methods
        return PROP_BAG;
    }
}

export class AnyList extends BaseList<AnyValListItem, IAnyVal> {
    private _onChanged: () => void;
    private _saveVal: string = null;

    constructor(onChanged: () => void) {
        super(AnyValListItem, [{ name: 'val', dtype: 0 }]);
        this._onChanged = onChanged;
        this.addOnBeginEdit((s, a) => {
            this._saveVal = JSON.stringify(a.item.val);
        });
        this.addOnEndEdit((s, a) => {
            if (a.isCanceled) {
                this._saveVal = null;
                return;
            }
            const oldVal = this._saveVal, newVal = JSON.parse(JSON.stringify(a.item.val));
            this._saveVal = null;
            if (oldVal !== newVal) {
                this.onChanged();
            }
        });
        this.addOnCollChanged((s, a) => {
            switch (a.changeType) {
                case COLL_CHANGE_TYPE.Remove:
                    {
                        this.onChanged();
                    }
                    break;
                default:
                    break;
            }
        });
        //adding new item (init val with an object)
        this.addOnItemAdding((s, a) => {
            a.item.val = {};
        });
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._onChanged = null;
        super.destroy();
    }

    protected onChanged() {
        if (!this._onChanged)
            return;
        setTimeout(() => {
            if (this.getIsDestroyCalled())
                return;
            if (!!this._onChanged)
                this._onChanged();
        }, 0);
     }
    toString() {
        return 'AnyList';
    }
}

export class ArrayVal extends BaseObject {
    private _vals: any[] = [];
    private _list: AnyList;

    constructor(arr: any[], onChanged: () => void = null) {
        super();
        this._list = new AnyList(onChanged);
        this.setArr(arr);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._list.destroy();
        this._list = null;
        super.destroy();
    }
    setArr(arr: any[]): void {
        this._vals = (!arr ? [] : arr);
        this._list.fillItems(this._vals.map((val) => {
            return { val: val };
        }), true);
    }
    //returns array with all the changes
    getArr(): any[] {
        const res = this._list.items.map((item) => {
            return item._aspect.vals["val"];
        });
        return res;
    }
    get list(): AnyList {
        return this._list;
    }

    toString() {
        return "ArrayVal";
    }
}