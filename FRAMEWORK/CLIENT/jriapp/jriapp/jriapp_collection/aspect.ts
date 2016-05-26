/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, DATA_TYPE } from "../jriapp_core/const";
import { IIndexer, IValidationInfo, IFieldInfo, IVoidPromise, TEventHandler, IErrorNotification } from "../jriapp_core/shared";
import { BaseObject }  from "../jriapp_core/object";
import { ERROR } from "../jriapp_utils/coreutils";
import { Utils as utils } from "../jriapp_utils/utils";
import { ERRS } from "../jriapp_core/lang";

import { ICollectionItem, IItemAspect, ICancellableArgs, ITEM_STATUS, PROP_NAME, ITEM_EVENTS } from "int";
import { BaseCollection } from "base";
import { fn_traverseFields } from "utils";
import { ValidationError, Validations } from "validation";

const coreUtils = utils.core, strUtils = utils.str, checks = utils.check;

export class ItemAspect<TItem extends ICollectionItem> extends BaseObject implements IItemAspect<TItem> {
    private __key: string;
    private __isEditing: boolean;
    private _collection: BaseCollection<TItem>;
    protected _status: ITEM_STATUS;
    protected _saveVals: IIndexer<any>;
    protected _vals: IIndexer<any>;
    protected _notEdited: boolean;
    protected get _isEditing(): boolean {
        return this.__isEditing;
    }
    protected set _isEditing(v: boolean) {
        if (this.__isEditing !== v) {
            this.__isEditing = v;
            this.raisePropertyChanged(PROP_NAME.isEditing);
        }
    }
    constructor(collection: BaseCollection<TItem>) {
        super();
        this.__key = null;
        this.__isEditing = false;
        this._collection = collection;
        this._status = ITEM_STATUS.None;
        this._saveVals = null;
        this._vals = {};
        this._notEdited = true;
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [ITEM_EVENTS.errors_changed].concat(base_events);
    }
    protected _onErrorsChanged(args: any) {
        this.raiseEvent(ITEM_EVENTS.errors_changed, args);
    }
    handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return this.collection.handleError(error, source);
        }
        return isHandled;
    }
    protected _beginEdit(): boolean {
        let coll = this.collection, isHandled: boolean;
        if (coll.isEditing) {
            let eitem = coll._getInternal().getEditingItem();
            if (eitem._aspect === this)
                return false;
            try {
                eitem._aspect.endEdit();
                if (eitem._aspect.getIsHasErrors()) {
                    this.handleError(new ValidationError(eitem._aspect.getAllErrors(), eitem), eitem);
                    eitem._aspect.cancelEdit();
                }
            } catch (ex) {
                isHandled = this.handleError(ex, eitem);
                eitem._aspect.cancelEdit();
                ERROR.reThrow(ex, isHandled);
            }
        }
        if (!this.key) //detached item
            return false;
        this._isEditing = true;
        this._saveVals = coreUtils.clone(this._vals);
        this.collection.currentItem = this.getItem();
        return true;
    }
    protected _endEdit(): boolean {
        if (!this.__isEditing)
            return false;
        let coll = this.collection, self = this;
        if (this.getIsHasErrors()) {
            return false;
        }
        //revalidate all
        coll._getInternal().removeAllErrors(this.getItem());
        let validation_errors = this._validateAll();
        if (validation_errors.length > 0) {
            coll._getInternal().addErrors(self.getItem(), validation_errors);
        }
        if (this.getIsHasErrors()) {
            return false;
        }
        this._isEditing = false;
        this._saveVals = null;
        return true;
    }
    protected _cancelEdit(): boolean {
        if (!this._isEditing)
            return false;
        let coll = this.collection, isNew = this.isNew, self = this;
        let changes = this._saveVals;
        this._vals = this._saveVals;
        this._saveVals = null;
        coll._getInternal().removeAllErrors(this.getItem());
        //refresh User interface when values restored
        coll.getFieldNames().forEach(function (name) {
            if (changes[name] !== self._vals[name])
                self.raisePropertyChanged(name);
        });
        this._isEditing = false;
        if (isNew && this._notEdited)
            coll.removeItem(this.getItem());
        return true;
    }
    protected _validate(): IValidationInfo {
        return this.collection._getInternal().validateItem(this.getItem());
    }
    protected _skipValidate(fieldInfo: IFieldInfo, val: any) {
        return false;
    }
    protected _validateField(fieldName: string): IValidationInfo {
        let val: any, fieldInfo = this.getFieldInfo(fieldName), res: IValidationInfo = null;
        try {
            val = coreUtils.getValue(this._vals, fieldName);
            if (this._skipValidate(fieldInfo, val))
                return res;
            if (this.isNew) {
                if (val === null && !fieldInfo.isNullable && !fieldInfo.isReadOnly && !fieldInfo.isAutoGenerated)
                    throw new Error(ERRS.ERR_FIELD_ISNOT_NULLABLE);
            }
            else {
                if (val === null && !fieldInfo.isNullable && !fieldInfo.isReadOnly)
                    throw new Error(ERRS.ERR_FIELD_ISNOT_NULLABLE);
            }
        } catch (ex) {
            res = { fieldName: fieldName, errors: [ex.message] };
        }
        let tmp = this.collection._getInternal().validateItemField(this.getItem(), fieldName);
        if (!!res && !!tmp) {
            res.errors = res.errors.concat(tmp.errors);
        }
        else if (!!tmp)
            res = tmp;
        return res;
    }
    protected _validateAll(): IValidationInfo[] {
        let self = this, fieldInfos = this.collection.getFieldInfos(), errs: IValidationInfo[] = [];
        fn_traverseFields(fieldInfos, (fld, fullName) => {
            if (fld.fieldType !== FIELD_TYPE.Object) {
                let res = self._validateField(fullName);
                if (!!res) {
                    errs.push(res);
                }
            }
        });

        let res = self._validate();
        if (!!res) {
            errs.push(res);
        }
        return errs;
    }
    protected _checkVal(fieldInfo: IFieldInfo, val: any): any {
        let res = val;
        if (this._skipValidate(fieldInfo, val))
            return res;
        if (fieldInfo.isReadOnly && !(fieldInfo.allowClientDefault && this.isNew))
            throw new Error(ERRS.ERR_FIELD_READONLY);
        if ((val === null || (checks.isString(val) && !val)) && !fieldInfo.isNullable)
            throw new Error(ERRS.ERR_FIELD_ISNOT_NULLABLE);

        if (val === null)
            return val;

        switch (fieldInfo.dataType) {
            case DATA_TYPE.None:
                break;
            case DATA_TYPE.Guid:
            case DATA_TYPE.String:
                if (!checks.isString(val)) {
                    throw new Error(strUtils.format(ERRS.ERR_FIELD_WRONG_TYPE, val, "String"));
                }
                if (fieldInfo.maxLength > 0 && val.length > fieldInfo.maxLength)
                    throw new Error(strUtils.format(ERRS.ERR_FIELD_MAXLEN, fieldInfo.maxLength));
                if (fieldInfo.isNullable && val === "")
                    res = null;
                if (!!fieldInfo.regex) {
                    let reg = new RegExp(fieldInfo.regex, "i");
                    if (!reg.test(val)) {
                        throw new Error(strUtils.format(ERRS.ERR_FIELD_REGEX, val));
                    }
                }
                break;
            case DATA_TYPE.Binary:
                if (!checks.isArray(val)) {
                    throw new Error(strUtils.format(ERRS.ERR_FIELD_WRONG_TYPE, val, "Array"));
                }
                if (fieldInfo.maxLength > 0 && val.length > fieldInfo.maxLength)
                    throw new Error(strUtils.format(ERRS.ERR_FIELD_MAXLEN, fieldInfo.maxLength));
                break;
            case DATA_TYPE.Bool:
                if (!checks.isBoolean(val))
                    throw new Error(strUtils.format(ERRS.ERR_FIELD_WRONG_TYPE, val, "Boolean"));
                break;
            case DATA_TYPE.Integer:
            case DATA_TYPE.Decimal:
            case DATA_TYPE.Float:
                if (!checks.isNumber(val))
                    throw new Error(strUtils.format(ERRS.ERR_FIELD_WRONG_TYPE, val, "Number"));
                if (!!fieldInfo.range) {
                    Validations.checkNumRange(Number(val), fieldInfo.range);
                }
                break;
            case DATA_TYPE.DateTime:
            case DATA_TYPE.Date:
                if (!checks.isDate(val))
                    throw new Error(strUtils.format(ERRS.ERR_FIELD_WRONG_TYPE, val, "Date"));
                if (!!fieldInfo.range) {
                    Validations.checkDateRange(val, fieldInfo.range);
                }
                break;
            case DATA_TYPE.Time:
                if (!checks.isDate(val))
                    throw new Error(strUtils.format(ERRS.ERR_FIELD_WRONG_TYPE, val, "Time"));
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "dataType", fieldInfo.dataType));
        }
        return res;
    }
    protected _resetIsNew() {
        //can reset isNew on all items in the collection
        //the list descendant does it
    }
    _onAttaching(): void {
    }
    _onAttach(): void {
    }
    raiseErrorsChanged(args: any): void {
        this._onErrorsChanged(args);
    }
    getFieldInfo(fieldName: string) {
        return this.collection.getFieldInfo(fieldName);
    }
    getFieldNames() {
        return this.collection.getFieldNames();
    }
    getErrorString(): string {
        let itemErrors = this.collection._getInternal().getErrors(this.getItem());
        if (!itemErrors)
            return "";
        let res: string[] = [];
        coreUtils.forEachProp(itemErrors, function (name) {
            res.push(strUtils.format("{0}: {1}", name, itemErrors[name]));
        });
        return res.join("|");
    }
    submitChanges(): IVoidPromise {
        let deferred = utils.defer.createDeferred<void>();
        deferred.reject();
        return deferred.promise();
    }
    rejectChanges(): void {
    }
    beginEdit(): boolean {
        let coll = this.collection;
        if (!this._beginEdit())
            return false;
        coll._getInternal().onEditing(this.getItem(), true, false);
        return true;
    }
    endEdit(): boolean {
        let coll = this.collection;
        if (!this._endEdit())
            return false;
        coll._getInternal().onEditing(this.getItem(), false, false);
        this._notEdited = false;
        return true;
    }
    cancelEdit(): boolean {
        let coll = this.collection;
        if (!this._cancelEdit())
            return false;
        coll._getInternal().onEditing(this.getItem(), false, true);
        return true;
    }
    deleteItem(): boolean {
        let coll = this.collection;
        if (!this.key)
            return false;
        let args: ICancellableArgs<TItem> = { item: this.getItem(), isCancel: false };
        coll._getInternal().onItemDeleting(args);
        if (args.isCancel) {
            return false;
        }
        coll.removeItem(this.getItem());
        return true;
    }
    getIsHasErrors() {
        let itemErrors = this.collection._getInternal().getErrors(this.getItem());
        return !!itemErrors;
    }
    addOnErrorsChanged(fn: TEventHandler<ItemAspect<TItem>, any>, nmspace?: string, context?: any) {
        this._addHandler(ITEM_EVENTS.errors_changed, fn, nmspace, context);
    }
    removeOnErrorsChanged(nmspace?: string) {
        this._removeHandler(ITEM_EVENTS.errors_changed, nmspace);
    }
    getFieldErrors(fieldName: string): IValidationInfo[] {
        let itemErrors = this.collection._getInternal().getErrors(this.getItem());
        if (!itemErrors)
            return [];
        let name = fieldName;
        if (!fieldName)
            fieldName = "*";
        if (!itemErrors[fieldName])
            return [];
        if (fieldName === "*")
            name = null;
        return [
            { fieldName: name, errors: itemErrors[fieldName] }
        ];
    }
    getAllErrors(): IValidationInfo[] {
        let itemErrors = this.collection._getInternal().getErrors(this.getItem());
        if (!itemErrors)
            return [];
        let res: IValidationInfo[] = [];
        coreUtils.forEachProp(itemErrors, function (name) {
            let fieldName: string = null;
            if (name !== "*") {
                fieldName = name;
            }
            res.push({ fieldName: fieldName, errors: itemErrors[name] });
        });
        return res;
    }
    getIErrorNotification(): IErrorNotification {
        return this;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let coll = this._collection;
        let item = this.getItem();
        if (!!item && !item._isDetached && !!item._key) {
            coll.removeItem(item);
        }
        if (!!item && !item.getIsDestroyCalled()) {
            item.destroy();
        }
        this.__key = null;
        this._saveVals = null;
        this._vals = {};
        this._isEditing = false;
        this._collection = null;
        super.destroy();
    }
    toString() {
        return "ItemAspect";
    }
    getItem(): TItem {
        throw new Error("Not implemented");
    }
    get isCanSubmit(): boolean { return false; }
    get status(): ITEM_STATUS { return this._status; }
    get isNew(): boolean {
        return false;
    }
    get isDeleted(): boolean { return false; }
    get key(): string { return this.__key; }
    set key(v: string) {
        if (v !== null)
            v = "" + v;
        this.__key = v;
    }
    get collection(): BaseCollection<TItem> { return this._collection; }
    get isUpdating(): boolean {
        let coll = this.collection;
        if (!coll)
            return false;
        return coll.isUpdating;
    }
    get isEditing(): boolean { return this.__isEditing; }
    get isHasChanges(): boolean { return this._status !== ITEM_STATUS.None; }
}