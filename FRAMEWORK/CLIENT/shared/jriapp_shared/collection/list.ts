/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE } from "./const";
import { IValidationInfo, IIndexer } from "../int";
import { Utils } from "../utils/utils";
import { ERRS } from "../lang";

import {
    COLL_CHANGE_REASON, COLL_CHANGE_TYPE, COLL_CHANGE_OPER
} from "./const";
import {
    ICollectionItem, IPropInfo, PROP_NAME
} from "./int";
import { fn_traverseField } from "./utils";
import { BaseCollection } from "./base";
import { ItemAspect } from "./aspect";
import { ValidationError } from "../errors";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, ERROR = utils.err;

export interface IListItem extends ICollectionItem {
    readonly _aspect: ListItemAspect<IListItem, any>;
}
export interface IListItemAspectConstructor<TItem extends IListItem, TObj> {
    new (coll: BaseList<TItem, TObj>, obj?: TObj): ListItemAspect<TItem, TObj>;
}
export interface IListItemConstructor<TItem extends IListItem, TObj> {
    new (aspect: ListItemAspect<TItem, TObj>): TItem;
}

export class ListItemAspect<TItem extends IListItem, TObj> extends ItemAspect<TItem> {
    protected _isNew: boolean;

    constructor(coll: BaseList<TItem, TObj>, obj?: TObj) {
        super(coll);
        this._isNew = !obj;
        if (this._isNew)
            this._initVals();
        else
            this._vals = <any>obj;
    }
    _setProp(name: string, val: any) {
        let error: ValidationError;
        const coll = this.collection, item = this.item, fieldInfo = this.getFieldInfo(name),
            errors = coll.errors;
        if (this._getProp(name) !== val) {
            try {
                if (fieldInfo.isReadOnly && !(this.isNew && fieldInfo.allowClientDefault)) {
                    throw new Error(ERRS.ERR_FIELD_READONLY);
                }
                coreUtils.setValue(this._vals, name, val, false);
                item.raisePropertyChanged(name);
                errors.removeError(item, name);
                const validation_info = this._validateField(name);
                if (!!validation_info && validation_info.errors.length > 0) {
                    throw new ValidationError([validation_info], this);
                }
            } catch (ex) {
                if (utils.sys.isValidationError(ex)) {
                    error = ex;
                }
                else {
                    error = new ValidationError([
                        { fieldName: name, errors: [ex.message] }
                    ], this);
                }
                errors.addError(item, name, error.validations[0].errors);
                throw error;
            }
        }
    }
    _getProp(name: string): any {
        return coreUtils.getValue(this._vals, name);
    }
    _resetIsNew(): void {
        this._isNew = false;
    }
    toString(): string {
        if (!this.item)
            return "ListItemAspect";
        return this.item.toString() + "Aspect";
    }
    get list(): BaseList<TItem, TObj> { return <BaseList<TItem, TObj>>this.collection; }
    get vals(): IIndexer<any> { return this._vals; }
    get isNew(): boolean { return this._isNew; }
}
export class BaseList<TItem extends IListItem, TObj> extends BaseCollection<TItem> {
    protected _itemType: IListItemConstructor<TItem, TObj>;

    constructor(itemType: IListItemConstructor<TItem, TObj>, props: IPropInfo[]) {
        super();
        this._itemType = itemType;
        if (!!props)
            this._updateFieldMap(props);
    }
    private _updateFieldMap(props: IPropInfo[]) {
        const self = this;
        if (!checks.isArray(props) || props.length === 0)
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "props", props));

        self._fieldMap = {};
        self._fieldInfos = [];
        props.forEach(function (prop) {
            let fldInfo = BaseCollection.getEmptyFieldInfo(prop.name);
            fldInfo.dataType = prop.dtype;
            self._fieldMap[prop.name] = fldInfo;
            self._fieldInfos.push(fldInfo);
            fn_traverseField(fldInfo, (fld, fullName) => {
                fld.dependents = null;
                fld.fullName = fullName;
            });
        });
    }
    protected _attach(item: TItem) {
        try {
            this.endEdit();
        } catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
        return super._attach(item);
    }
    //override
    protected _createNew(): TItem {
        return this.createItem(null);
    }
    //the item parameter is not used here, but can be used in descendants
    protected _getNewKey(item: TItem) {
        //client side item ID
        const key = "clkey_" + this._newKey;
        this._newKey += 1;
        return key;
    }
    protected createItem(obj?: TObj): TItem {
        const aspect = new ListItemAspect<TItem, TObj>(this, obj);
        const item = new this._itemType(aspect);
        aspect.key = this._getNewKey(item);
        aspect.item = item;
        return item;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._itemType = null;
        super.destroy();
    }
    fillItems(objArray: TObj[], clearAll?: boolean) {
        const self = this, newItems: TItem[] = [], positions: number[] = [], items: TItem[] = [];
        if (!objArray)
            objArray = [];
        try {
            if (!!clearAll) this.clear();
            objArray.forEach(function (obj) {
                const item = self.createItem(obj), oldItem = self._itemsByKey[item._key];
                if (!oldItem) {
                    self._items.push(item);
                    self._itemsByKey[item._key] = item;
                    newItems.push(item);
                    positions.push(self._items.length - 1);
                    items.push(item);
                }
                else {
                    items.push(oldItem);
                }
            });

            if (newItems.length > 0) {
                this.raisePropertyChanged(PROP_NAME.count);
            }
        }
        finally {
            this._onCollectionChanged({
                changeType: COLL_CHANGE_TYPE.Reset,
                reason: COLL_CHANGE_REASON.None,
                oper: COLL_CHANGE_OPER.Fill,
                items: items,
                pos: positions
            });
            this._onFillEnd({
                items: items,
                newItems: newItems,
                reason: COLL_CHANGE_REASON.None
            });
        }
        this.moveFirst();
    }
    toArray() {
        return this.items.map((item, index, arr) => {
            return <TObj>coreUtils.clone(item._aspect.vals);
        });
    }
    getNewObjects() {
        return this._items.filter(function (item) {
            return item._aspect.isNew;
        });
    }
    resetNewObjects() {
        this._items.forEach(function (item) {
            item._aspect._resetIsNew();
        });
    }
    toString() {
        return "BaseList";
    }
}