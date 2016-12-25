/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IPropertyBag } from "../int";
import { CoreUtils } from "./coreutils";
import { SysUtils } from "./sysutils";
import { StringUtils } from "./strutils";
import { Debounce } from "./debounce";
import { COLL_CHANGE_TYPE } from "../collection/const";
import { ICollChangedArgs, ICollectionItem } from "../collection/int";
import { CollectionItem } from "../collection/item";
import { IListItem, ListItemAspect, BaseList } from "../collection/list";

const core = CoreUtils, strUtils = StringUtils;

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
    onBagPropChanged(name: string): void {
        this.raisePropertyChanged("[" + name + "]");
    }
    //override
    _isHasProp(prop: string): boolean {
        //first check for indexed property name
        if (strUtils.startsWith(prop, "[")) {
            return true;
        }
        return super._isHasProp(prop);
    }
    getProp(name: string): any {
        return core.getValue(this.val, name, '->');
    }
    setProp(name: string, val: any): void {
        const old = core.getValue(this.val, name, '->');
        if (old !== val) {
            core.setValue(this.val, name, val, false, '->');
            this.onBagPropChanged(name);
        }
    }
    get isPropertyBag() {
        return true;
    }
    get list(): AnyList {
        return <AnyList>this._aspect.list;
    }
    toString() {
        return "AnyValListItem";
    }
}

export class AnyList extends BaseList<AnyValListItem, IAnyVal> {
    private _onChanged: (arr: any[]) => void;
    private _saveVal: string = null;
    private _debounce: Debounce;

    constructor(onChanged: (arr: any[]) => void) {
        super(AnyValListItem, [{ name: 'val', dtype: 0 }]);
        this._onChanged = onChanged;
        this._debounce = new Debounce();

        this.addOnBeginEdit((s, a) => {
            this._saveVal = JSON.stringify(a.item.val);
        });

        this.addOnEndEdit((s, a) => {
            if (a.isCanceled) {
                this._saveVal = null;
                a.item.onBagPropChanged("*");
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
        this._isDestroyCalled = true;
        this._debounce.destroy();
        this._onChanged = null;
        super.destroy();
    }

    protected onChanged() {
        this._debounce.enqueue(() => {
            if (!!this._onChanged) {
                const arr = this.items.map((item) => {
                    return item._aspect.vals["val"];
                });
                this._onChanged(arr);
            }
        });
    }
    setValues(values: any[]): void {
        const vals: IAnyVal[] = values.map((val) => {
            return { val: val };
        });
        this.fillItems(vals, true);
    }
    toString() {
        return "AnyList";
    }
}