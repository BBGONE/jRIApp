/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils } from "../utils/utils";
import { ERRS } from "../lang";
import { IIndexer } from "../int";
import {
    COLL_CHANGE_REASON, COLL_CHANGE_TYPE, COLL_CHANGE_OPER, ITEM_STATUS
} from "./const";
import {
    ICollectionItem, IPropInfo, IFieldInfo
} from "./int";
import { CollUtils } from "./utils";
import { BaseCollection } from "./base";
import { ItemAspect } from "./aspect";
import { ValidationError } from "../errors";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, collUtils = CollUtils, sys = utils.sys;

export interface IListItem extends ICollectionItem {
    readonly _aspect: ListItemAspect<IListItem, any>;
}

export class ListItemAspect<TItem extends IListItem, TObj> extends ItemAspect<TItem, TObj> {
    _setProp(name: string, val: any) {
        if (this.isCancelling) {
            return;
        }
        let error: ValidationError;
        const coll = this.collection, item = this.item, fieldInfo = this.getFieldInfo(name),
            errors = coll.errors;
        if (this._getProp(name) !== val) {
            try {
                if (fieldInfo.isReadOnly && !(this.isNew && fieldInfo.allowClientDefault)) {
                    throw new Error(ERRS.ERR_FIELD_READONLY);
                }
                coreUtils.setValue(this._vals, name, val, false);
                sys.raiseProp(item, name);
                errors.removeError(item, name);
                const validationInfo = this._validateField(name);
                if (!!validationInfo && validationInfo.errors.length > 0) {
                    throw new ValidationError([validationInfo], this);
                }
            } catch (ex) {
                if (utils.sys.isValidationError(ex)) {
                    error = ex;
                } else {
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
    _resetStatus(): void {
        this._status = ITEM_STATUS.None;
    }
    toString(): string {
        if (!this.item) {
            return "ListItemAspect";
        }
        return this.item.toString() + "Aspect";
    }
    get list(): BaseList<TItem, TObj> { return <BaseList<TItem, TObj>>this.collection; }
}

export abstract class BaseList<TItem extends IListItem, TObj> extends BaseCollection<TItem> {
    private _fieldMap: IIndexer<IFieldInfo>;
    private _fieldInfos: IFieldInfo[];
    private _newKey: number;

    constructor(props: IPropInfo[]) {
        super();
        this._fieldMap = {};
        this._fieldInfos = [];
        this._newKey = 0;

        if (!!props) {
            this._updateFieldMap(props);
        }
    }
    private _updateFieldMap(props: IPropInfo[]) {
        const self = this;
        if (!checks.isArray(props) || props.length === 0) {
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "props", props));
        }

        self._fieldMap = {};
        self._fieldInfos = [];
        props.forEach(function (prop) {
            const fldInfo = BaseCollection.getEmptyFieldInfo(prop.name);
            fldInfo.dataType = prop.dtype;
            self._fieldMap[prop.name] = fldInfo;
            self._fieldInfos.push(fldInfo);
            collUtils.walkField(fldInfo, (fld, fullName) => {
                fld.dependents = null;
                fld.fullName = fullName;
            });
        });
    }
    protected _clear(reason: COLL_CHANGE_REASON, oper: COLL_CHANGE_OPER) {
        super._clear(reason, oper);
        this._newKey = 0;
    }
    protected createItem(obj?: TObj): TItem {
        const isNew = !obj, vals: any = isNew ? collUtils.initVals(this.getFieldInfos(), {}) : obj,
        key = this._getNewKey();
        const aspect = new ListItemAspect<TItem, TObj>(this, vals, key, isNew);
        return aspect.item;
    }
    protected _getNewKey() {
        // client side item ID
        const key = "clkey_" + this._newKey;
        this._newKey += 1;
        return key;
    }
    // override
    protected _createNew(): TItem {
        return this.createItem(null);
    }
    // override
    getFieldMap(): IIndexer<IFieldInfo> {
        return this._fieldMap;
    }
    // override
    getFieldInfos(): IFieldInfo[] {
        return this._fieldInfos;
    }
    fillItems(objArray: TObj[], clearAll?: boolean) {
        const self = this, newItems: TItem[] = [], positions: number[] = [], items: TItem[] = [];
        if (!objArray) {
            objArray = [];
        }
        try {
            if (!!clearAll) {
                this.clear();
            }
            objArray.forEach(function (obj) {
                const item = self.createItem(obj), oldItem = self.getItemByKey(item._key);
                if (!oldItem) {
                    positions.push(self._appendItem(item));
                    newItems.push(item);
                    items.push(item);
                    item._aspect._setIsAttached(true);
                } else {
                    items.push(oldItem);
                }
            });

            if (newItems.length > 0) {
                this.objEvents.raiseProp("count");
            }
        } finally {
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
    getNewItems(): TItem[] {
        return this.items.filter(function (item) {
            return item._aspect.isNew;
        });
    }
    resetStatus(): void {
        this.items.forEach(function (item) {
            item._aspect._resetStatus();
        });
    }
    toArray(): TObj[] {
        return this.items.map((item) => {
            return <TObj>item._aspect.vals;
        });
    }
    toString(): string {
        return "BaseList";
    }
}
