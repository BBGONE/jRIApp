/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IPropertyBag, IValidationInfo } from "../int";
import { CoreUtils } from "./coreutils";
import { SysUtils } from "./sysutils";
import { StringUtils } from "./strutils";
import { Debounce } from "./debounce";
import { COLL_CHANGE_TYPE } from "../collection/const";
import { ICollChangedArgs, ICollectionItem, ICollValidateFieldArgs } from "../collection/int";
import { CollectionItem } from "../collection/item";
import { IListItem, ListItemAspect, BaseList } from "../collection/list";
import { ValidationError } from "../errors";

export {  ICollValidateFieldArgs } from "../collection/int";

const coreUtils = CoreUtils, strUtils = StringUtils, sys = SysUtils;

export interface IAnyVal {
    val: any;
}

export class AnyItemAspect<TItem extends IListItem, TObj> extends ListItemAspect<TItem, TObj> {
    constructor(coll: BaseList<TItem, TObj>, obj?: TObj) {
        super(coll, obj);
    }
    //override and made public
    _validateField(name: string): IValidationInfo {
        const coll = this.collection, internal = coll._getInternal(), result = internal.validateItemField(this.item, name);
        return result;
    }
    //override
    protected _validateFields(): IValidationInfo[] {
        const self = this, result: IValidationInfo[] = [], res = self._validateItem();
        return res;
    }
    //override
    _setProp(name: string, val: any) {
        if (name !== "val")
            throw new Error("Invalid operation: the value name must be 'val'");
        if (!val)
            val = {};
        if (this._getProp(name) !== val) {
            coreUtils.setValue(this._vals, name, val, false);
            this.item.raisePropertyChanged(name);
        }
    }
    //override
    _getProp(name: string) {
        if (name !== "val")
            throw new Error("Invalid operation: the value name must be 'val'");
        let res = coreUtils.getValue(this._vals, name);
        if (!res) {
            res = {};
            coreUtils.setValue(this._vals, "val", res, false);
        }
        return res;
    }
}


export class AnyValListItem extends CollectionItem<AnyItemAspect<AnyValListItem, IAnyVal>> implements IListItem, IPropertyBag, IAnyVal {
    constructor(aspect: AnyItemAspect<AnyValListItem, IAnyVal>) {
        super(aspect);
    }
    get val(): any { return <any>this._aspect._getProp('val'); }
    set val(v: any) { this._aspect._setProp('val', v); }
    //override
    _isHasProp(prop: string): boolean {
        //first check for indexed property name
        if (strUtils.startsWith(prop, "[")) {
            return true;
        }
        return super._isHasProp(prop);
    }
    getProp(name: string): any {
        const fieldName = strUtils.trimBrackets(name);
        return coreUtils.getValue(this.val, fieldName, '->');
    }
    setProp(name: string, val: any): void {
        const coll = this._aspect.collection, internal = coll._getInternal();
        const old = this.getProp(name);
        if (old !== val) {
            try {
                const fieldName = strUtils.trimBrackets(name);
                coreUtils.setValue(this.val, fieldName, val, false, '->');
                this.raisePropertyChanged(name);
                internal.removeError(this, name);
                const validation: IValidationInfo = this._aspect._validateField(name);
                if (!!validation && validation.errors.length > 0) {
                    throw new ValidationError([validation], this);
                }
            } catch (ex) {
                let error: ValidationError;
                if (sys.isValidationError(ex)) {
                    error = ex;
                }
                else {
                    error = new ValidationError([
                        { fieldName: name, errors: [ex.message] }
                    ], this);
                }
                internal.addError(this, name, error.validations[0].errors);
                throw error;
            }
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
                a.item.raisePropertyChanged("[*]");
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
    //override
    protected createItem(obj?: IAnyVal): AnyValListItem {
        const aspect = new AnyItemAspect<AnyValListItem, IAnyVal>(this, obj);
        const item = new this._itemType(aspect);
        aspect.key = this._getNewKey(item);
        aspect.item = item;
        return item;
    }
    protected onChanged() {
        this._debounce.enque(() => {
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