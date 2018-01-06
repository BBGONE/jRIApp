/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { FIELD_TYPE, ITEM_STATUS } from "./const";
import { IFieldInfo } from "./int";
import { IVoidPromise } from "../utils/ideferred";
import { IIndexer, IValidationInfo, TEventHandler, IErrorNotification } from "../int";
import { BaseObject } from "../object";
import { Utils } from "../utils/utils";
import { ICollectionItem, IItemAspect, ICancellableArgs, ITEM_EVENTS } from "./int";
import { BaseCollection } from "./base";
import { CollUtils } from "./utils";
import { ValidationError } from "../errors";
import { Validations } from "./validation";

const utils = Utils, { forEachProp, getValue } = utils.core, { isNt } = utils.check,
    sys = utils.sys, ERROR = utils.err, { cloneVals, walkFields, copyVals } = CollUtils;

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

function disposeVal(entry: ICustomVal, nmspace: string): void {
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

function checkDetached<TItem extends ICollectionItem, TObj>(aspect: IItemAspect<TItem, TObj>): void {
    if (aspect.isDetached) {
        throw new Error("Invalid operation. The item is detached");
    }
}

export abstract class ItemAspect<TItem extends ICollectionItem, TObj> extends BaseObject implements IItemAspect<TItem, TObj> {
    private _key: string;
    private _item: TItem;
    private _coll: BaseCollection<TItem>;
    private _flags: number;
    private _valueBag: IIndexer<ICustomVal>;
    protected _status: ITEM_STATUS;
    protected _saveVals: IIndexer<any>;
    protected _vals: IIndexer<any>;

    constructor(collection: BaseCollection<TItem>, vals: any, key: string, isNew: boolean) {
        super();
        this._coll = collection;
        this._vals = vals;
        this._key = key;
        this._status = isNew ? ITEM_STATUS.Added : ITEM_STATUS.None;
        this._saveVals = null;
        this._flags = 0;
        this._valueBag = null;
        this._item = null;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        const coll = this._coll, item = this._item;
        if (!!item) {
            this.cancelEdit();

            if (!this.isDetached) {
                coll.removeItem(item);
            }
        }
        const bag = this._valueBag;
        if (!!bag) {
            forEachProp(bag, (name, val) => {
                disposeVal(val, coll.uniqueID);
            });
        }
        this._flags = 0;
        super.dispose();
    }
    protected _onErrorsChanged(): void {
        this.objEvents.raise(ITEM_EVENTS.errors_changed, {});
    }
    private _getFlag(flag: AspectFlags): boolean {
        return !!(this._flags & (1 << flag));
    }
    private _setFlag(v: boolean, flag: AspectFlags) {
        if (v) {
            this._flags |= (1 << flag);
        } else {
            this._flags &= ~(1 << flag);
        }
    }
    protected _setIsEdited(v: boolean) {
        this._setFlag(v, AspectFlags.IsEdited);
    }
    protected _setIsCancelling(v: boolean) {
        this._setFlag(v, AspectFlags.IsCancelling);
    }
    protected _beginEdit(): boolean {
        checkDetached(this);
        const coll = this.coll;
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
        this._saveVals = cloneVals(this.coll.getFieldInfos(), this._vals);
        this.coll.currentItem = this.item;
        return true;
    }
    protected _endEdit(): boolean {
        if (!this.isEditing) {
            return false;
        }
        checkDetached(this);
        const coll = this.coll, self = this, errors = coll.errors;
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
        checkDetached(this);
        const coll = this.coll, self = this,
            item = self.item, changes = this._saveVals;
        this._vals = this._saveVals;
        this._saveVals = null;
        coll.errors.removeAllErrors(item);
        // refresh User interface when values restored
        coll.getFieldNames().forEach((name) => {
            if (changes[name] !== self._vals[name]) {
                sys.raiseProp(this.item, name);
            }
        });

        return true;
    }
    protected _skipValidate(fieldInfo: IFieldInfo, val: any) {
        return false;
    }
    protected _validateItem(): IValidationInfo[] {
        return this.coll.errors.validateItem(this.item);
    }
    protected _validateField(fieldName: string): IValidationInfo {
        const fieldInfo = this.getFieldInfo(fieldName), errors = this.coll.errors;
        const value = getValue(this._vals, fieldName);
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
        const self = this, fieldInfos = this.coll.getFieldInfos(),
            res: IValidationInfo[] = [];
        // revalidate all fields one by one
        walkFields(fieldInfos, (fld, fullName) => {
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
    protected _resetStatus(): void {
        // can reset isNew on all items in the collection
        // the list descendant does it
    }
    _setKey(v: string): void {
        this._key = v;
    }
    _setIsAttached(v: boolean): void {
        this._setFlag(v, AspectFlags.IsAttached);
    }
    _setIsRefreshing(v: boolean): void {
        if (this.isRefreshing !== v) {
            this._setFlag(v, AspectFlags.IsRefreshing);
            this.objEvents.raiseProp("isRefreshing");
        }
    }
    handleError(error: any, source: any): boolean {
        return this.coll.handleError(error, source);
    }
    raiseErrorsChanged(): void {
        this._onErrorsChanged();
    }
    getFieldInfo(fieldName: string): IFieldInfo {
        return this.coll.getFieldInfo(fieldName);
    }
    getFieldNames(): string[] {
        return this.coll.getFieldNames();
    }
    getErrorString(): string {
        const itemErrors = this.coll.errors.getErrors(this.item);
        if (!itemErrors) {
            return "";
        }
        const res: string[] = [];
        forEachProp(itemErrors, (name, errs) => {
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
        // noop
    }
    beginEdit(): boolean {
        checkDetached(this);
        if (this.isEditing) {
            return false;
        }
        const coll = this.coll, internal = coll._getInternal(), item = this.item;
        internal.onBeforeEditing(item, true, false);
        if (!this._beginEdit()) {
            return false;
        }
        internal.onEditing(item, true, false);
        if (!!this._valueBag && this.isEditing) {
            forEachProp(this._valueBag, (name, obj) => {
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
        checkDetached(this);
        const coll = this.coll, internal = coll._getInternal(), item = this.item;
        internal.onBeforeEditing(item, false, false);
        let customEndEdit = true;
        if (!!this._valueBag) {
            forEachProp(this._valueBag, (name, obj) => {
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
        checkDetached(this);
        this._setIsCancelling(true);
        try {
            const coll = this.coll, internal = coll._getInternal(), item = this.item, isNew = this.isNew;
            internal.onBeforeEditing(item, false, true);
            if (!!this._valueBag) {
                forEachProp(this._valueBag, (name, obj) => {
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
        const coll = this.coll;
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
    getIsHasErrors(): boolean {
        let res = !!this.coll.errors.getErrors(this.item);
        if (!res && !!this._valueBag) {
            forEachProp(this._valueBag, (name, obj) => {
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
    addOnErrorsChanged(fn: TEventHandler<ItemAspect<TItem, TObj>, any>, nmspace?: string, context?: any): void {
        this.objEvents.on(ITEM_EVENTS.errors_changed, fn, nmspace, context);
    }
    offOnErrorsChanged(nmspace?: string): void {
        this.objEvents.off(ITEM_EVENTS.errors_changed, nmspace);
    }
    getFieldErrors(fieldName: string): IValidationInfo[] {
        const res: IValidationInfo[] = [], itemErrors = this.coll.errors.getErrors(this.item);
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
            forEachProp(this._valueBag, (name, obj) => {
                const errNotification = sys.getErrorNotification(obj.val);
                if (!!errNotification) {
                    res = res.concat(errNotification.getAllErrors());
                }
            });
        }

        const itemErrors = this.coll.errors.getErrors(this.item);
        if (!itemErrors) {
            return res;
        }
        forEachProp(itemErrors, (name) => {
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
            if (isNt(val)) {
                return;
            }
            this._valueBag = {};
        }

        const oldEntry = this._valueBag[name],  coll = this.coll;

        if (!!oldEntry && oldEntry.val !== val) {
            disposeVal(oldEntry, coll.uniqueID);
        }

        if (isNt(val)) {
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
    toString(): string {
        return "ItemAspect";
    }
    // cloned values of this item
    get vals(): TObj {
        return copyVals(this.coll.getFieldInfos(), this._vals, {});
    }
    get item(): TItem {
        if (!this._item) {
            this._item = this.coll.itemFactory(this);
        }
        return this._item;
    }
    get key(): string {
        return this._key;
    }
    get coll(): BaseCollection<TItem> {
        return this._coll;
    }
    get status(): ITEM_STATUS {
        return this._status;
    }
    get isUpdating(): boolean {
        return this.coll.isUpdating;
    }
    get isEditing(): boolean {
        const editingItem = this.coll._getInternal().getEditingItem();
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
        return this._getFlag(AspectFlags.IsEdited);
    }
    get isDetached(): boolean {
        // opposite of attached!
        return !this._getFlag(AspectFlags.IsAttached);
    }
    get isRefreshing(): boolean {
        return this._getFlag(AspectFlags.IsRefreshing);
    }
    get isCancelling(): boolean {
        return this._getFlag(AspectFlags.IsCancelling);
    }
}
