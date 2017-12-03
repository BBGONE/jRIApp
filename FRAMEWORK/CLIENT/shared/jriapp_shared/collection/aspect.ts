/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, ITEM_STATUS } from "./const";
import { IFieldInfo } from "./int";
import { IVoidPromise } from "../utils/ideferred";
import { IIndexer, IValidationInfo, TEventHandler, IErrorNotification } from "../int";
import { BaseObject } from "../object";
import { Utils } from "../utils/utils";
import { ICollectionItem, IItemAspect, ICancellableArgs, PROP_NAME, ITEM_EVENTS } from "./int";
import { BaseCollection } from "./base";
import { CollUtils } from "./utils";
import { ValidationError } from "../errors";
import { Validations } from "./validation";

const utils = Utils, coreUtils = utils.core, checks = utils.check,
    sys = utils.sys, ERROR = utils.err, collUtils = CollUtils;

const enum AspectFlags {
    IsAttached = 0,
    IsEdited = 1,
    IsRefreshing = 2,
    IsCancelling = 3
}

interface ICustomVal {
    val: any;
    isOwnIt: boolean;
}

function fn_destroyVal(entry: ICustomVal, nmspace: string): void {
    if (!entry) {
        return;
    }
    const val = entry.val;

    if (sys.isEditable(val) && val.isEditing) {
        val.cancelEdit();
    }

    const errNotification = sys.getErrorNotification(val);
    if (!!errNotification) {
        errNotification.offOnErrorsChanged(nmspace);
    }

    if (entry.isOwnIt && sys.isBaseObj(val)) {
        val.dispose();
    }
}

function fn_checkDetached<TItem extends ICollectionItem, TObj>(aspect: IItemAspect<TItem, TObj>): void {
    if (aspect.isDetached) {
        throw new Error("Invalid operation. The item is detached");
    }
}

export abstract class ItemAspect<TItem extends ICollectionItem, TObj> extends BaseObject implements IItemAspect<TItem, TObj> {
    private _key: string;
    private _item: TItem;
    private _collection: BaseCollection<TItem>;
    protected _status: ITEM_STATUS;
    protected _saveVals: IIndexer<any>;
    protected _vals: IIndexer<any>;
    private _flags: number;
    private _valueBag: IIndexer<ICustomVal>;
  
    constructor(collection: BaseCollection<TItem>) {
        super();
        this._collection = collection;
        this._key = null;
        this._item = null;
        this._status = ITEM_STATUS.None;
        this._saveVals = null;
        this._vals = null;
        this._flags = 0;
        this._valueBag = null;
    }
    protected _onErrorsChanged() {
        this.objEvents.raise(ITEM_EVENTS.errors_changed, {});
    }
    protected _setIsEdited(v: boolean) {
        if (v) {
            this._flags |= (1 << AspectFlags.IsEdited);
        } else {
            this._flags &= ~(1 << AspectFlags.IsEdited);
        }
    }
    protected _setIsCancelling(v: boolean) {
        if (v) {
            this._flags |= (1 << AspectFlags.IsCancelling);
        } else {
            this._flags &= ~(1 << AspectFlags.IsCancelling);
        }
    }
    protected _beginEdit(): boolean {
        fn_checkDetached(this);
        const coll = this.collection;
        let isHandled: boolean = false;
        if (coll.isEditing) {
            const item = coll._getInternal().getEditingItem();
            if (item._aspect === this) {
                return false;
            }
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
        this._saveVals = collUtils.cloneVals(this.collection.getFieldInfos(), this._vals);
        this.collection.currentItem = this.item;
        return true;
    }
    protected _endEdit(): boolean {
        if (!this.isEditing) {
            return false;
        }
        fn_checkDetached(this);
        const coll = this.collection, self = this, errors = coll.errors;
        // revalidate all
        errors.removeAllErrors(this.item);
        const validations: IValidationInfo[] = this._validateFields();
        if (validations.length > 0) {
            errors.addErrors(self.item, validations);
        }
        if (this.getIsHasErrors()) {
            return false;
        }
        this._saveVals = null;
        return true;
    }
    protected _cancelEdit(): boolean {
        if (!this.isEditing) {
            return false;
        }
        fn_checkDetached(this);
        const coll = this.collection, self = this,
            item = self.item, changes = this._saveVals;
        this._vals = this._saveVals;
        this._saveVals = null;
        coll.errors.removeAllErrors(item);
        // refresh User interface when values restored
        coll.getFieldNames().forEach((name) => {
            if (changes[name] !== self._vals[name]) {
                item.objEvents.raiseProp(name);
            }
        });

        return true;
    }
    protected _skipValidate(fieldInfo: IFieldInfo, val: any) {
        return false;
    }
    protected _validateItem(): IValidationInfo[] {
        return this.collection.errors.validateItem(this.item);
    }
    protected _validateField(fieldName: string): IValidationInfo {
        const fieldInfo = this.getFieldInfo(fieldName), errors = this.collection.errors;
        const value = coreUtils.getValue(this._vals, fieldName);
        if (this._skipValidate(fieldInfo, value)) {
            return null;
        }
        const standardErrors: string[] = Validations.checkField(fieldInfo, value, this.isNew);
        const customValidation: IValidationInfo = errors.validateItemField(this.item, fieldName);

        const result = { fieldName: fieldName, errors: <string[]>[] };
        if (standardErrors.length > 0) {
            result.errors = standardErrors;
        }
        if (!!customValidation && customValidation.errors.length > 0) {
            result.errors = result.errors.concat(customValidation.errors);
        }

        return (result.errors.length > 0) ? result : null;
    }
    protected _validateFields(): IValidationInfo[] {
        const self = this, fieldInfos = this.collection.getFieldInfos(),
            res: IValidationInfo[] = [];
        // revalidate all fields one by one
        collUtils.walkFields(fieldInfos, (fld, fullName) => {
            if (fld.fieldType !== FIELD_TYPE.Object) {
                const fieldValidation: IValidationInfo = self._validateField(fullName);
                if (!!fieldValidation && fieldValidation.errors.length > 0) {
                    res.push(fieldValidation);
                }
            }
        });

        // raise validation event for the whole item validation
        const itemVals: IValidationInfo[] = self._validateItem();
        return Validations.distinct(res.concat(itemVals));
    }
    protected _resetStatus() {
        // can reset isNew on all items in the collection
        // the list descendant does it
    }
    handleError(error: any, source: any): boolean {
        return this.collection.handleError(error, source);
    }
    _setItem(v: TItem) {
        this._item = v;
    }
    _setKey(v: string) {
        this._key = v;
    }
    _setIsAttached(v: boolean) {
        if (v) {
            this._flags |= (1 << AspectFlags.IsAttached);
        } else {
            this._flags &= ~(1 << AspectFlags.IsAttached);
        }
    }
    _setIsRefreshing(v: boolean) {
        if (this.isRefreshing !== v) {
            if (v) {
                this._flags |= (1 << AspectFlags.IsRefreshing);
            } else {
                this._flags &= ~(1 << AspectFlags.IsRefreshing);
            }
            this.objEvents.raiseProp(PROP_NAME.isRefreshing);
        }
    }
    _onAttaching(): void {
    }
    _onAttach(): void {
        this._setIsAttached(true);
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
        const itemErrors = this.collection.errors.getErrors(this.item);
        if (!itemErrors) {
            return "";
        }
        const res: string[] = [];
        coreUtils.forEachProp(itemErrors, (name, errs) => {
            for (let i = 0; i < errs.length; i += 1) {
                res.push(`${name}: ${errs[i]}`);
            }
        });
        return res.join("|");
    }
    submitChanges(): IVoidPromise {
        return utils.defer.reject<void>("not implemented");
    }
    rejectChanges(): void {
    }
    beginEdit(): boolean {
        fn_checkDetached(this);
        if (this.isEditing) {
            return false;
        }
        const coll = this.collection, internal = coll._getInternal(), item = this.item;
        internal.onBeforeEditing(item, true, false);
        if (!this._beginEdit()) {
            return false;
        }
        internal.onEditing(item, true, false);
        if (!!this._valueBag && this.isEditing) {
            coreUtils.forEachProp(this._valueBag, (name, obj) => {
                if (!!obj && sys.isEditable(obj.val)) {
                    obj.val.beginEdit();
                }
            });
        }
        return true;
    }
    endEdit(): boolean {
        if (!this.isEditing) {
            return false;
        }
        fn_checkDetached(this);
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
        if (!customEndEdit || !this._endEdit()) {
            return false;
        }
        internal.onEditing(item, false, false);
        this._setIsEdited(true);
        return true;
    }
    cancelEdit(): boolean {
        if (!this.isEditing) {
            return false;
        }
        fn_checkDetached(this);
        this._setIsCancelling(true);
        try {
            const coll = this.collection, internal = coll._getInternal(), item = this.item, isNew = this.isNew;
            internal.onBeforeEditing(item, false, true);
            if (!!this._valueBag) {
                coreUtils.forEachProp(this._valueBag, (name, obj) => {
                    if (!!obj && sys.isEditable(obj.val)) {
                        obj.val.cancelEdit();
                    }
                });
            }
            if (!this._cancelEdit()) {
                return false;
            }
            internal.onEditing(item, false, true);
            if (isNew && !this.isEdited && !this.getIsStateDirty()) {
                this.dispose();
            }
        } finally {
            this._setIsCancelling(false);
        }
        return true;
    }
    deleteItem(): boolean {
        const coll = this.collection;
        if (this.isDetached) {
            return false;
        }
        const args: ICancellableArgs<TItem> = { item: this.item, isCancel: false };
        coll._getInternal().onItemDeleting(args);
        if (args.isCancel) {
            return false;
        }
        this.dispose();
        return true;
    }
    getIsHasErrors() {
        let res = !!this.collection.errors.getErrors(this.item);
        if (!res && !!this._valueBag) {
            coreUtils.forEachProp(this._valueBag, (name, obj) => {
                if (!!obj) {
                    const errNotification = sys.getErrorNotification(obj.val);
                    if (!!errNotification && errNotification.getIsHasErrors()) {
                        res = true;
                    }
                }
            });
        }
        return res;
    }
    addOnErrorsChanged(fn: TEventHandler<ItemAspect<TItem, TObj>, any>, nmspace?: string, context?: any) {
        this.objEvents.on(ITEM_EVENTS.errors_changed, fn, nmspace, context);
    }
    offOnErrorsChanged(nmspace?: string) {
        this.objEvents.off(ITEM_EVENTS.errors_changed, nmspace);
    }
    getFieldErrors(fieldName: string): IValidationInfo[] {
        const res: IValidationInfo[] = [], itemErrors = this.collection.errors.getErrors(this.item);
        if (!itemErrors) {
            return res;
        }
        let name = fieldName;
        if (!fieldName) {
            fieldName = "*";
        }
        if (!itemErrors[fieldName]) {
            return res;
        }
        if (fieldName === "*") {
            name = null;
        }
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

        const itemErrors = this.collection.errors.getErrors(this.item);
        if (!itemErrors) {
            return res;
        }
        coreUtils.forEachProp(itemErrors, (name) => {
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
    // can be used to store any user object
    setCustomVal(name: string, val: any, isOwnVal: boolean = true): void {
        if (!this._valueBag) {
            if (checks.isNt(val)) {
                return;
            }
            this._valueBag = {};
        }

        const oldEntry = this._valueBag[name],  coll = this.collection;

        if (!!oldEntry && oldEntry.val !== val) {
            fn_destroyVal(oldEntry, coll.uniqueID);
        }

        if (checks.isNt(val)) {
            delete this._valueBag[name];
        } else {
            const newEntry: ICustomVal = { val: val, isOwnIt: !!isOwnVal };
            this._valueBag[name] = newEntry;
            const errNotification = sys.getErrorNotification(val);
            if (!!errNotification) {
                errNotification.addOnErrorsChanged(() => {
                    this.raiseErrorsChanged();
                }, coll.uniqueID);
            }

            if (this.isEditing && sys.isEditable(val)) {
                val.beginEdit();
            }
        }
    }
    getCustomVal(name: string): any {
        if (!this._valueBag) {
            return null;
        }
        const obj = this._valueBag[name];
        return (!obj) ? null: obj.val;
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const coll = this._collection, item = this._item;
        if (!!item) {
            this.cancelEdit();
            const bag = this._valueBag;
            if (!!bag) {
                coreUtils.forEachProp(bag, (name, val) => {
                    fn_destroyVal(val, coll.uniqueID);
                });
            }

            if (!this.isDetached) {
                coll.removeItem(item);
            }
        }
        this._flags = 0;
        super.dispose();
    }
    toString() {
        return "ItemAspect";
    }
    // cloned values of this item
    get vals(): TObj {
        return collUtils.copyVals(this.collection.getFieldInfos(), this._vals, {});
    }
    get item(): TItem {
        return this._item;
    }
    get key(): string {
        return this._key;
    }
    get collection(): BaseCollection<TItem> {
        return this._collection;
    }
    get status(): ITEM_STATUS {
        return this._status;
    }
    get isUpdating(): boolean {
        return this.collection.isUpdating;
    }
    get isEditing(): boolean {
        const editingItem = this.collection._getInternal().getEditingItem();
        return !!editingItem && editingItem._aspect === this;
    }
    get isCanSubmit(): boolean {
        return false;
    }
    get isHasChanges(): boolean {
        return this._status !== ITEM_STATUS.None;
    }
    get isNew(): boolean {
        return this._status === ITEM_STATUS.Added;
    }
    get isDeleted(): boolean {
        return this._status === ITEM_STATUS.Deleted;
    }
    get isEdited(): boolean {
        return !!(this._flags & (1 << AspectFlags.IsEdited));
    }
    get isDetached(): boolean {
        // opposite of attached!
        return !(this._flags & (1 << AspectFlags.IsAttached));
    }
    get isRefreshing(): boolean {
        return !!(this._flags & (1 << AspectFlags.IsRefreshing));
    }
    get isCancelling(): boolean {
        return !!(this._flags & (1 << AspectFlags.IsCancelling));
    }
}
