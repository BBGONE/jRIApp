/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, DATA_TYPE, ITEM_STATUS } from "./const";
import { IFieldInfo } from "./int";
import { IVoidPromise } from "../utils/ideferred";
import {
    IIndexer, IValidationInfo, TEventHandler, IErrorNotification, IBaseObject
} from "../int";
import { BaseObject } from "../object";
import { ERRS } from "../lang";
import { Utils } from "../utils/utils";

import { ICollectionItem, IItemAspect, ICancellableArgs, PROP_NAME, ITEM_EVENTS } from "./int";
import { BaseCollection } from "./base";
import { fn_traverseFields } from "./utils";
import { ValidationError } from "../errors";
import { Validations } from "./validation";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check,
    sys = utils.sys, ERROR = utils.err;

interface ICustomVal
{
    val: any;
    isOwnIt: boolean;
}


export class ItemAspect<TItem extends ICollectionItem> extends BaseObject implements IItemAspect<TItem> {
    private _key: string;
    private _item: TItem;
    private _collection: BaseCollection<TItem>;
    protected _status: ITEM_STATUS;
    protected _saveVals: IIndexer<any>;
    protected _vals: IIndexer<any>;
    protected _notEdited: boolean;
    private _isCached: boolean;
    private _isDetached: boolean;
    private _valueBag: IIndexer<ICustomVal>;
    
    _setIsDetached(v: boolean) {
        this._isDetached = v;
    }
    _setIsCached(v: boolean) {
        this._isCached = v;
    }
    constructor(collection: BaseCollection<TItem>) {
        super();
        this._key = null;
        this._item = null;
        this._collection = collection;
        this._status = ITEM_STATUS.None;
        this._saveVals = null;
        this._vals = {};
        this._notEdited = true;
        this._isCached = false;
        this._isDetached = false;
    }
    protected _getEventNames() {
        const base_events = super._getEventNames();
        return [ITEM_EVENTS.errors_changed].concat(base_events);
    }
    protected _onErrorsChanged() {
        this.raiseEvent(ITEM_EVENTS.errors_changed, {});
    }
    protected _beginEdit(): boolean {
        if (this.isDetached)
            throw new Error("Invalid operation. The item is detached");
        const coll = this.collection;
        let isHandled: boolean = false;
        if (coll.isEditing) {
            const item = coll._getInternal().getEditingItem();
            if (item._aspect === this)
                return false;
            try {
                item._aspect.endEdit();
                if (item._aspect.getIsHasErrors()) {
                    this.handleError(new ValidationError(item._aspect.getAllErrors(), item), item);
                    item._aspect.cancelEdit();
                }
            } catch (ex) {
                isHandled = this.handleError(ex, item);
                item._aspect.cancelEdit();
                ERROR.reThrow(ex, isHandled);
            }
        }
        this._saveVals = coreUtils.clone(this._vals);
        this.collection.currentItem = this.item;
        return true;
    }
    protected _endEdit(): boolean {
        if (this.isDetached)
            throw new Error("Invalid operation. The item is detached");
        if (!this.isEditing)
            return false;
        const coll = this.collection, self = this, internal = coll._getInternal();
        //revalidate all
        internal.removeAllErrors(this.item);
        const validations: IValidationInfo[] = this._validateFields();
        if (validations.length > 0) {
            internal.addErrors(self.item, validations);
        }
        if (this.getIsHasErrors()) {
            return false;
        }
        this._saveVals = null;
        return true;
    }
    protected _cancelEdit(): boolean {
        if (this.isDetached)
            throw new Error("Invalid operation. The item is detached");
        if (!this.isEditing)
            return false;
        const coll = this.collection, self = this, item = self.item, changes = this._saveVals;
        this._vals = this._saveVals;
        this._saveVals = null;
        coll._getInternal().removeAllErrors(item);
        //refresh User interface when values restored
        coll.getFieldNames().forEach(function (name) {
            if (changes[name] !== self._vals[name]) {
                item.raisePropertyChanged(name);
            }
        });
        return true;
    }
    protected _skipValidate(fieldInfo: IFieldInfo, val: any) {
        return false;
    }
    protected _validateItem(): IValidationInfo[] {
        return this.collection._getInternal().validateItem(this.item);
    }
    protected _validateField(fieldName: string): IValidationInfo {
        const fieldInfo = this.getFieldInfo(fieldName), internal = this.collection._getInternal();
        const value = coreUtils.getValue(this._vals, fieldName);
        if (this._skipValidate(fieldInfo, value))
            return null;
        const standardErrors: string[] = Validations.checkField(fieldInfo, value, this.isNew);
        const customValidation: IValidationInfo = internal.validateItemField(this.item, fieldName);

        let result = { fieldName: fieldName, errors: <string[]>[] };
        if (standardErrors.length > 0) {
            result.errors = standardErrors;
        }
        if (!!customValidation && customValidation.errors.length > 0)
        {
            result.errors = result.errors.concat(customValidation.errors);
        }

        if (result.errors.length > 0)
            return result;
        else
            return null;
    }
    protected _validateFields(): IValidationInfo[] {
        const self = this, fieldInfos = this.collection.getFieldInfos();
        let result: IValidationInfo[] = [];
        fn_traverseFields(fieldInfos, (fld, fullName) => {
            if (fld.fieldType !== FIELD_TYPE.Object) {
                const fieldValidation: IValidationInfo = self._validateField(fullName);
                if (!!fieldValidation && fieldValidation.errors.length > 0) {
                    result.push(fieldValidation);
                }
            }
        });
        //raise validation event for custom validation
        const customValidation: IValidationInfo[] = self._validateItem(), toAppend: IValidationInfo[] = [];
        customValidation.forEach((validation) => {
           let fieldValidation = result.filter((test) => {
                return test.fieldName === validation.fieldName;
            });
           if (fieldValidation.length > 0) {
               fieldValidation[0].errors = fieldValidation[0].errors.concat(validation.errors);
           }
           else
           {
               if (validation.errors.length > 0)
                   toAppend.push(validation);
           }
        });

        if (toAppend.length > 0) {
            result = utils.arr.merge([result, toAppend]);
        }
        return result;
    }
    protected _resetIsNew() {
        //can reset isNew on all items in the collection
        //the list descendant does it
    }
    protected _fakeDestroy() {
        this.raiseEvent(ITEM_EVENTS.destroyed, {});
        this.removeNSHandlers();
    }
    public handleError(error: any, source: any): boolean {
        if (!this._collection)
            return super.handleError(error, source);
        else
            return this._collection.handleError(error, source);
    }
    _onAttaching(): void {
    }
    _onAttach(): void {
    }
    raiseErrorsChanged(): void {
        this._onErrorsChanged();
    }
    getFieldInfo(fieldName: string) {
        return this.collection.getFieldInfo(fieldName);
    }
    getFieldNames() {
        return this.collection.getFieldNames();
    }
    getErrorString(): string {
        const itemErrors = this.collection._getInternal().getErrors(this.item);
        if (!itemErrors)
            return "";
        let res: string[] = [];
        coreUtils.forEachProp(itemErrors, function (name) {
            res.push(strUtils.format("{0}: {1}", name, itemErrors[name]));
        });
        return res.join("|");
    }
    submitChanges(): IVoidPromise {
        return utils.defer.reject<void>();
    }
    rejectChanges(): void {
    }
    beginEdit(): boolean {
        if (this.isEditing)
            return false;
        const coll = this.collection, internal = coll._getInternal(), item = this.item;
        internal.onBeforeEditing(item, true, false);
        if (!this._beginEdit())
            return false;
        internal.onEditing(item, true, false);
        if (!!this._valueBag && this.isEditing) {
            coreUtils.forEachProp(this._valueBag, (name, obj) => {
                if (!!obj && sys.isEditable(obj.val))
                    obj.val.beginEdit();
            });
        }
        return true;
    }
    endEdit(): boolean {
        if (!this.isEditing)
            return false;
        const coll = this.collection, internal = coll._getInternal(), item = this.item;
        internal.onBeforeEditing(item, false, false);
        let customEndEdit = true;
        if (!!this._valueBag) {
            coreUtils.forEachProp(this._valueBag, (name, obj) => {
                if (!!obj && sys.isEditable(obj.val)) {
                    if (!obj.val.endEdit()) {
                        customEndEdit = false;
                    }
                }
            });
        }
        if (!customEndEdit || !this._endEdit())
            return false;
        internal.onEditing(item, false, false);
        this._notEdited = false;
        return true;
    }
    cancelEdit(): boolean {
        if (!this.isEditing)
            return false;
        const coll = this.collection, internal = coll._getInternal(), item = this.item, isNew = this.isNew;
        internal.onBeforeEditing(item, false, true);
        if (!!this._valueBag) {
            coreUtils.forEachProp(this._valueBag, (name, obj) => {
                if (!!obj && sys.isEditable(obj.val))
                    obj.val.cancelEdit();
            });
        }
        if (!this._cancelEdit())
            return false;
        internal.onEditing(item, false, true);
        if (isNew && this._notEdited && !this.getIsDestroyCalled()) {
            this.destroy();
        }
        return true;
    }
    deleteItem(): boolean {
        let coll = this.collection;
        if (!this.key)
            return false;
        let args: ICancellableArgs<TItem> = { item: this.item, isCancel: false };
        coll._getInternal().onItemDeleting(args);
        if (args.isCancel) {
            return false;
        }
        this.destroy();
        return true;
    }
    getIsHasErrors() {
        let res = !!this.collection._getInternal().getErrors(this.item);
        if (!res && !!this._valueBag) {
            coreUtils.forEachProp(this._valueBag, (name, obj) => {
                const errNotification = sys.getErrorNotification(obj.val);
                if (!!errNotification) {
                    if (errNotification.getIsHasErrors())
                        res = true;
                }
            });
        }
        return res;
    }
    addOnErrorsChanged(fn: TEventHandler<ItemAspect<TItem>, any>, nmspace?: string, context?: any) {
        this._addHandler(ITEM_EVENTS.errors_changed, fn, nmspace, context);
    }
    removeOnErrorsChanged(nmspace?: string) {
        this._removeHandler(ITEM_EVENTS.errors_changed, nmspace);
    }
    getFieldErrors(fieldName: string): IValidationInfo[] {
        let res: IValidationInfo[] = [];
        const itemErrors = this.collection._getInternal().getErrors(this.item);
        if (!itemErrors)
            return res;
        let name = fieldName;
        if (!fieldName)
            fieldName = "*";
        if (!itemErrors[fieldName])
            return [];
        if (fieldName === "*")
            name = null;
        res.push({ fieldName: name, errors: itemErrors[fieldName] });
        return res;
    }
    getAllErrors(): IValidationInfo[] {
        let res: IValidationInfo[] = [];
        if (!!this._valueBag) {
            coreUtils.forEachProp(this._valueBag, (name, obj) => {
                const errNotification = sys.getErrorNotification(obj.val);
                if (!!errNotification) {
                    res = res.concat(errNotification.getAllErrors());
                }
            });
        }

        const itemErrors = this.collection._getInternal().getErrors(this.item);
        if (!itemErrors)
            return res;
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
    private _delCustomVal(entry: ICustomVal) {
        const coll = this.collection;
        if (!!entry) {
            const val = entry.val;

            if (sys.isEditable(val) && val.isEditing) {
                val.cancelEdit();
            }

            const errNotification = sys.getErrorNotification(val);
            if (!!errNotification) {
                errNotification.removeOnErrorsChanged(coll.uniqueID);
            }

            if (entry.isOwnIt && sys.isBaseObj(val)) {
                val.destroy();
            }
        }
    }
    // can be used to store any user object
    setCustomVal(name: string, val: any, isOwnVal: boolean = true): void {
        if (this.getIsDestroyCalled())
            return;
        const coll = this.collection;

        if (!this._valueBag) {
            if (checks.isNt(val))
                return;
            this._valueBag = {};
        }

        const oldEntry = this._valueBag[name];

        if (!!oldEntry && oldEntry.val !== val) {
            this._delCustomVal(oldEntry);
        }

        if (checks.isNt(val)) {
            delete this._valueBag[name];
        }
        else {
            const newEntry: ICustomVal = { val: val, isOwnIt: !!isOwnVal };
            this._valueBag[name] = newEntry;
            const errNotification = sys.getErrorNotification(val);
            if (!!errNotification) {
                errNotification.addOnErrorsChanged(() => {
                    this.raiseErrorsChanged();
                }, coll.uniqueID);
            }

            if (this.isEditing && sys.isEditable(val))
                val.beginEdit();
        }
    }
    getCustomVal(name: string): any {
        if (this.getIsDestroyCalled() || !this._valueBag)
            return null;

        const obj = this._valueBag[name];
        if (!obj) {
            return null;
        }
        return obj.val;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        const self = this;
        this._isDestroyCalled = true;
        const coll = this._collection, item = this._item;
        if (!!item) {
            this.cancelEdit();
            if (this._isCached) {
                try {
                    this._fakeDestroy();
                }
                finally {
                    this._isDestroyCalled = false;
                }
                return;
            }

            if (!!this._valueBag) {
                utils.core.forEachProp(this._valueBag, (name) => {
                    self._delCustomVal(self._valueBag[name]);
                });

                this._valueBag = null;
            }

            if (!item._aspect.isDetached) {
                coll.removeItem(item);
            }
        }
        this._key = null;
        this._saveVals = null;
        this._vals = {};
        this._isCached = false;
        this._isDetached = true;
        this._collection = null;
        super.destroy(); 
    }
    toString() {
        return "ItemAspect";
    }
    get item(): TItem {
        return this._item;
    }
    set item(v: TItem) {
        this._item = v;
    }
    get isCanSubmit(): boolean { return false; }
    get status(): ITEM_STATUS { return this._status; }
    get isNew(): boolean {
        return false;
    }
    get isNotEdited(): boolean {
        return this._notEdited;
    }
    get isDeleted(): boolean { return false; }
    get key(): string { return this._key; }
    set key(v: string) {
        if (v !== null)
            v = "" + v;
        this._key = v;
    }
    get collection(): BaseCollection<TItem> { return this._collection; }
    get isUpdating(): boolean {
        let coll = this.collection;
        if (!coll)
            return false;
        return coll.isUpdating;
    }
    get isEditing(): boolean {
        const coll = this._collection, editingItem = !coll ? <TItem>null : coll._getInternal().getEditingItem();
        return !!editingItem && editingItem._aspect === this;
    }
    get isHasChanges(): boolean { return this._status !== ITEM_STATUS.None; }
    get isCached(): boolean { return this._isCached; }
    get isDetached(): boolean { return this._isDetached; }
}