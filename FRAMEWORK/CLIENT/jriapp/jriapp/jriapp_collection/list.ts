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
import { FIELD_TYPE } from "../jriapp_core/const";
import { IValidationInfo, IIndexer } from "../jriapp_core/shared";
import { ERROR } from "../jriapp_utils/coreutils";
import { Utils as utils } from "../jriapp_utils/utils";
import { ERRS } from "../jriapp_core/lang";

import { ICollectionItem, IPropInfo, COLL_CHANGE_TYPE, COLL_CHANGE_REASON, COLL_CHANGE_OPER, PROP_NAME } from "int";
import { fn_traverseFields, fn_traverseField } from "utils";
import { BaseCollection } from "base";
import { ItemAspect } from "aspect";
import { ValidationError } from "validation";

const coreUtils = utils.core, strUtils = utils.str, checks = utils.check;

export interface IListItem extends ICollectionItem {
    _aspect: ListItemAspect<IListItem, any>;
}
export interface IListItemAspectConstructor<TItem extends IListItem, TObj> {
    new (coll: BaseList<TItem, TObj>, itemType: IListItemConstructor<TItem, TObj>, obj?: TObj): ListItemAspect<TItem, TObj>;
}
export interface IListItemConstructor<TItem extends IListItem, TObj> {
    new (aspect: ListItemAspect<TItem, TObj>): TItem;
}

export class ListItemAspect<TItem extends IListItem, TObj> extends ItemAspect<TItem> {
    protected _isNew: boolean;
    protected _item: TItem;

    constructor(coll: BaseList<TItem, TObj>, itemType: IListItemConstructor<TItem, TObj>, obj?: TObj) {
        super(coll);
        let self = this;
        this._isNew = !obj ? true : false;
        this._item = null;
        if (!!obj)
            this._vals = <any>obj;
        else
            this._vals = ListItemAspect._initVals(coll, obj);
        this._item = new itemType(this);
    }
    protected static _initVals(coll: BaseList<IListItem, any>, obj?: any): any {
        let vals = obj || {};
        if (!!obj) {
            //if no object then set all values to nulls
            let fieldInfos = coll.getFieldInfos();
            fn_traverseFields(fieldInfos, (fld, fullName) => {
                if (fld.fieldType === FIELD_TYPE.Object)
                    coreUtils.setValue(vals, fullName, {}, false);
                else
                    coreUtils.setValue(vals, fullName, null, false);
            });
        }
        return vals;
    }
    _setProp(name: string, val: any) {
        let validation_error: IValidationInfo, error: ValidationError, coll = this.collection;
        if (this._getProp(name) !== val) {
            try {
                coreUtils.setValue(this._vals, name, val, false);
                this.getItem().raisePropertyChanged(name);
                coll._getInternal().removeError(this.getItem(), name);
                validation_error = this._validateField(name);
                if (!!validation_error) {
                    throw new ValidationError([validation_error], this);
                }
            } catch (ex) {
                if (ex instanceof ValidationError) {
                    error = ex;
                }
                else {
                    error = new ValidationError([
                        { fieldName: name, errors: [ex.message] }
                    ], this);
                }
                coll._getInternal().addError(this.getItem(), name, error.errors[0].errors);
                throw error;
            }
        }
    }
    _getProp(name: string) {
        return coreUtils.getValue(this._vals, name);
    }
    _resetIsNew() {
        this._isNew = false;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        super.destroy();
        this._item = null;
    }
    getItem(): TItem {
        return this._item;
    }
    toString() {
        if (!this._item)
            return "ListItemAspect";
        return this._item.toString() + "Aspect";
    }
    get vals() { return this._vals; }
    get isNew() { return this._isNew; }
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
        let self = this;
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
    protected _createNew(): TItem {
        let aspect = new ListItemAspect<TItem, TObj>(this, this._itemType, null);
        //a new client item ID
        aspect.key = this._getNewKey(null);
        return aspect.getItem();
    }
    //the item parameter is not used here, but can be used in descendants
    protected _getNewKey(item: TItem) {
        //client's item ID
        let key = "clkey_" + this._newKey;
        this._newKey += 1;
        return key;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._itemType = null;
        super.destroy();
    }
    fillItems(objArray: TObj[], clearAll?: boolean) {
        let self = this, newItems: TItem[] = [], positions: number[] = [], items: TItem[] = [];
        if (!objArray)
            objArray = [];
        try {
            if (!!clearAll) this.clear();
            objArray.forEach(function (obj) {
                let aspect: ListItemAspect<TItem, TObj> = new ListItemAspect<TItem, TObj>(self, self._itemType, obj);
                let item = aspect.getItem();
                aspect.key = self._getNewKey(item);
                let oldItem = self._itemsByKey[aspect.key];
                if (!oldItem) {
                    self._items.push(item);
                    self._itemsByKey[aspect.key] = item;
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