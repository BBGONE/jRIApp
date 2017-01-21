/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    FIELD_TYPE, DATE_CONVERSION, DATA_TYPE, SORT_ORDER, ITEM_STATUS
} from "jriapp_shared/collection/const";
import {
    IIndexer, IValidationInfo, IVoidPromise, IPromise, LocaleERRS as ERRS, Utils
} from "jriapp_shared";
import { ValidationError } from "jriapp_shared/errors";
import { ICancellableArgs, IFieldInfo } from "jriapp_shared/collection/int";
import { ValueUtils, CollUtils } from "jriapp_shared/collection/utils";
import { ItemAspect } from "jriapp_shared/collection/aspect";
import { FLAGS, REFRESH_MODE, PROP_NAME } from "./const";
import { DbContext } from "./dbcontext";
import { IEntityItem, IRowData, IFieldName, IValueChange, IRowInfo } from "./int";
import { DbSet } from "./dbset";
import { SubmitError } from "./error";

const utils = Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core,
    valUtils = ValueUtils, collUtils = CollUtils, sys = utils.sys;

const ENTITYASPECT_EVENTS = {
    destroyed: "destroyed"
};

//don't submit these types of fields to the server
function fn_isNotSubmittable(fieldInfo: IFieldInfo) {
    return (fieldInfo.fieldType === FIELD_TYPE.ClientOnly || fieldInfo.fieldType === FIELD_TYPE.Navigation || fieldInfo.fieldType === FIELD_TYPE.Calculated || fieldInfo.fieldType === FIELD_TYPE.ServerCalculated);
}

function _fn_traverseChanges(name: string, val: IValueChange, fn: (name: string, val: IValueChange) => void) {
    if (!!val.nested && val.nested.length > 0) {
        const len = val.nested.length;
        for (let i = 0; i < len; i += 1) {
            let prop: IValueChange = val.nested[i];
            if (!!prop.nested && prop.nested.length > 0) {
                _fn_traverseChanges(name + "." + prop.fieldName, prop, fn);
            }
            else {
                fn(name + "." + prop.fieldName, prop);
            }
        }
    }
    else {
        fn(name, val);
    }
}

function fn_traverseChanges(val: IValueChange, fn: (name: string, val: IValueChange) => void): void {
    _fn_traverseChanges(val.fieldName, val, fn);
}

export interface IEntityAspectConstructor<TItem extends IEntityItem, TObj, TDbContext extends DbContext> {
    new (dbSet: DbSet<TItem, TObj, TDbContext>, row: IRowData, names: IFieldName[]): EntityAspect<TItem, TObj, TDbContext>;
}

export class EntityAspect<TItem extends IEntityItem, TObj, TDbContext extends DbContext> extends ItemAspect<TItem, TObj> {
    private _srvKey: string;
    private _origVals: IIndexer<any>;
    private _savedStatus: ITEM_STATUS;

    constructor(dbSet: DbSet<TItem, TObj, TDbContext>, vals: TObj, key: string, isNew: boolean) {
        super(dbSet);
        this._srvKey = null;
        this._origVals = null;
        this._savedStatus = null;
        this._vals = vals;
        const item = dbSet.itemFactory(this);
        this._setItem(item);
        if (isNew) {
            this._setKey(key);
            this._status = ITEM_STATUS.Added;
        }
        else {
            this._setSrvKey(key);
            this._setKey(key);
        }
    }
    protected _onFieldChanged(fieldName: string, fieldInfo: IFieldInfo) {
        const self = this;
        if (self._isDestroyCalled)
            return;
        self.item.raisePropertyChanged(fieldName);
        if (!!fieldInfo.dependents && fieldInfo.dependents.length > 0) {
            fieldInfo.dependents.forEach((d) => {
                self.item.raisePropertyChanged(d);
            });
        }
    }
    protected _getValueChange(fullName: string, fieldInfo: IFieldInfo, changedOnly: boolean): IValueChange {
        const self = this, dbSet = self.dbSet;
        let res: IValueChange = null;
        if (fn_isNotSubmittable(fieldInfo))
            return res;

        if (fieldInfo.fieldType === FIELD_TYPE.Object) {
            res = { fieldName: fieldInfo.fieldName, val: null, orig: null, flags: FLAGS.None, nested: [] };
            let len = fieldInfo.nested.length;
            for (let i = 0; i < len; i += 1) {
                let tmp = self._getValueChange(fullName + "." + fieldInfo.nested[i].fieldName, fieldInfo.nested[i], changedOnly);
                if (!!tmp) {
                    res.nested.push(tmp);
                }
            }
        }
        else {
            const newVal = dbSet._getInternal().getStrValue(coreUtils.getValue(self._vals, fullName), fieldInfo),
                oldV = self._origVals === null ? newVal : dbSet._getInternal().getStrValue(coreUtils.getValue(self._origVals, fullName), fieldInfo),
                isChanged = (oldV !== newVal);
            if (isChanged)
                res = {
                    fieldName: fieldInfo.fieldName,
                    val: newVal,
                    orig: oldV,
                    flags: (FLAGS.Changed | FLAGS.Setted),
                    nested: null
                };
            else if (fieldInfo.isPrimaryKey > 0 || fieldInfo.fieldType === FIELD_TYPE.RowTimeStamp || fieldInfo.isNeedOriginal)
                res = {
                    fieldName: fieldInfo.fieldName,
                    val: newVal,
                    orig: oldV,
                    flags: FLAGS.Setted,
                    nested: null
                };
            else
                res = {
                    fieldName: fieldInfo.fieldName,
                    val: null,
                    orig: null,
                    flags: FLAGS.None,
                    nested: null
                };
        }

        if (changedOnly) {
            if (fieldInfo.fieldType === FIELD_TYPE.Object) {
                if (res.nested.length > 0)
                    return res;
                else
                    return null;
            }
            else if ((res.flags & FLAGS.Changed) === FLAGS.Changed)
                return res;
            else
                return null;
        }
        else {
            return res;
        }
    }
    protected _getValueChanges(changedOnly: boolean): IValueChange[] {
        const self = this, flds = this.dbSet.getFieldInfos();
        const res = flds.map((fld) => {
            return self._getValueChange(fld.fieldName, fld, changedOnly);
        });

        //remove nulls
        const res2 = res.filter((vc) => {
            return !!vc;
        });
        return res2;
    }
    protected _fldChanging(fieldName: string, fieldInfo: IFieldInfo, oldV: any, newV: any) {
        if (!this._origVals) {
            this._origVals = collUtils.cloneVals(this.dbSet.getFieldInfos(), this._vals); //coreUtils.clone(this._vals);
        }
        return true;
    }
    protected _skipValidate(fieldInfo: IFieldInfo, val: any) {
        let childToParentNames = this.dbSet._getInternal().getChildToParentNames(fieldInfo.fieldName), res = false;
        if (!!childToParentNames && val === null) {
            for (let i = 0, len = childToParentNames.length; i < len; i += 1) {
                res = !!this._getFieldVal(childToParentNames[i]);
                if (res)
                    break;
            }
        }
        return res;
    }
    protected _beginEdit() {
        if (!super._beginEdit())
            return false;
        this._savedStatus = this.status;
        return true;
    }
    protected _endEdit() {
        if (!super._endEdit())
            return false;
        this._savedStatus = null;
        return true;
    }
    protected _cancelEdit() {
        if (!this.isEditing)
            return false;
        const self = this, changes = this._getValueChanges(true), isNew = this.isNew, dbSet = this.dbSet;
        this._vals = this._saveVals;
        this._saveVals = null;
        this._setStatus(this._savedStatus);
        this._savedStatus = null;
        dbSet.errors.removeAllErrors(this.item);
        changes.forEach((v) => {
            const fld = self.dbSet.getFieldInfo(v.fieldName);
            if (!fld)
                throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, v.fieldName));
            self._onFieldChanged(v.fieldName, fld);
        });
        return true;
    }
    protected _setStatus(v: ITEM_STATUS) {
        if (this._status !== v) {
            const oldStatus = this._status;
            this._status = v;
            if (v !== ITEM_STATUS.None)
                this.dbSet._getInternal().addToChanged(this.item);
            else
                this.dbSet._getInternal().removeFromChanged(this.key);
            this.dbSet._getInternal().onItemStatusChanged(this.item, oldStatus);
        }
    }
    _updateKeys(key: string) {
        this._setSrvKey(key);
        this._setKey(key);
    }
    _checkCanRefresh() {
        if (this.key === null || this.status === ITEM_STATUS.Added) {
            throw new Error(ERRS.ERR_OPER_REFRESH_INVALID);
        }
    }
    _refreshValue(val: any, fullName: string, refreshMode: REFRESH_MODE) {
        const self = this, fld = self.dbSet.getFieldInfo(fullName);
        if (!fld)
            throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, fullName));
        let stz = self.serverTimezone, newVal: any, oldVal: any, oldValOrig: any, dataType = fld.dataType, dcnv = fld.dateConversion;
        newVal = valUtils.parseValue(val, dataType, dcnv, stz);
        oldVal = coreUtils.getValue(self._vals, fullName);
        switch (refreshMode) {
            case REFRESH_MODE.CommitChanges:
                {
                    if (!valUtils.compareVals(newVal, oldVal, dataType)) {
                        coreUtils.setValue(self._vals, fullName, newVal, false);
                        self._onFieldChanged(fullName, fld);
                    }
                }
                break;
            case REFRESH_MODE.RefreshCurrent:
                {
                    if (!!self._origVals) {
                        coreUtils.setValue(self._origVals, fullName, newVal, false);
                    }
                    if (!!self._saveVals) {
                        coreUtils.setValue(self._saveVals, fullName, newVal, false);
                    }
                    if (!valUtils.compareVals(newVal, oldVal, dataType)) {
                        coreUtils.setValue(self._vals, fullName, newVal, false);
                        self._onFieldChanged(fullName, fld);
                    }
                }
                break;
            case REFRESH_MODE.MergeIntoCurrent:
                {
                    if (!!self._origVals) {
                        oldValOrig = coreUtils.getValue(self._origVals, fullName);
                        coreUtils.setValue(self._origVals, fullName, newVal, false);
                    }
                    if (oldValOrig === checks.undefined || valUtils.compareVals(oldValOrig, oldVal, dataType)) {
                        //unmodified
                        if (!valUtils.compareVals(newVal, oldVal, dataType)) {
                            coreUtils.setValue(self._vals, fullName, newVal, false);
                            self._onFieldChanged(fullName, fld);
                        }
                    }
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "refreshMode", refreshMode));
        }
    }
    _refreshValues(rowInfo: IRowInfo, refreshMode: REFRESH_MODE) {
        const self = this, oldStatus = this.status;
        if (!this._isDestroyed) {
            if (!refreshMode) {
                refreshMode = REFRESH_MODE.RefreshCurrent;
            }
            rowInfo.values.forEach((val) => {
                fn_traverseChanges(val, (fullName, vc) => {
                    if (!((vc.flags & FLAGS.Refreshed) === FLAGS.Refreshed))
                        return;
                    self._refreshValue(vc.val, fullName, refreshMode);
                });
            });

            if (oldStatus === ITEM_STATUS.Updated) {
                const changes = this._getValueChanges(true);
                if (changes.length === 0) {
                    this._origVals = null;
                    this._setStatus(ITEM_STATUS.None);
                }
            }
        }
    }
    _getRowInfo() {
        let res: IRowInfo = {
            values: this._getValueChanges(false),
            changeType: this.status,
            serverKey: this.srvKey,
            clientKey: this.key,
            error: null
        };
        return res;
    }
    _getCalcFieldVal(fieldName: string) {
        return this.dbSet._getInternal().getCalcFieldVal(fieldName, this.item);
    }
    _getNavFieldVal(fieldName: string) {
        return this.dbSet._getInternal().getNavFieldVal(fieldName, this.item);
    }
    _setNavFieldVal(fieldName: string, value: any) {
        this.dbSet._getInternal().setNavFieldVal(fieldName, this.item, value)
    }
    _clearFieldVal(fieldName: string) {
        coreUtils.setValue(this._vals, fieldName, null, false);
    }
    _getFieldVal(fieldName: string) {
        if (this._isDestroyCalled)
            return null;
        return coreUtils.getValue(this._vals, fieldName);
    }
    _setFieldVal(fieldName: string, val: any): boolean {
        let dbSetName = this.dbSetName, dbSet = this.dbSet,
            oldV = this._getFieldVal(fieldName), newV = val, fieldInfo = this.getFieldInfo(fieldName), res = false;
        if (!fieldInfo)
            throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, dbSetName, fieldName));
        if (!this.isEditing && !this.isUpdating)
            this.beginEdit();
        try {
            if (fieldInfo.dataType === DATA_TYPE.String && fieldInfo.isNullable && !newV)
                newV = null;
            if (oldV !== newV) {
                if (fieldInfo.isReadOnly && !(this.isNew && fieldInfo.allowClientDefault)) {
                    throw new Error(ERRS.ERR_FIELD_READONLY);
                }

                if (this._fldChanging(fieldName, fieldInfo, oldV, newV)) {
                    coreUtils.setValue(this._vals, fieldName, newV, false);
                    if (!(fieldInfo.fieldType === FIELD_TYPE.ClientOnly || fieldInfo.fieldType === FIELD_TYPE.ServerCalculated)) {
                        switch (this.status) {
                            case ITEM_STATUS.None:
                                this._setStatus(ITEM_STATUS.Updated);
                                break;
                        }
                    }
                    this._onFieldChanged(fieldName, fieldInfo);
                    res = true;
                }
                dbSet.errors.removeError(this.item, fieldName);
                const validation_info = this._validateField(fieldName);
                if (!!validation_info) {
                    throw new ValidationError([validation_info], this);
                }
            }
        } catch (ex) {
            let error: ValidationError;
            if (sys.isValidationError(ex)) {
                error = ex;
            }
            else {
                error = new ValidationError([
                    { fieldName: fieldName, errors: [ex.message] }
                ], this);
            }
            dbSet.errors.addError(this.item, fieldName, error.validations[0].errors);
            throw error;
        }
        return res;
    }
    _setSrvKey(v: string) {
        this._srvKey = v;
    }
    _acceptChanges(rowInfo?: IRowInfo): void {
        if (this.getIsDestroyed())
            return;
        const oldStatus = this.status, dbSet = this.dbSet, internal = dbSet._getInternal(),  errors = dbSet.errors;
        if (oldStatus !== ITEM_STATUS.None) {
            internal.onCommitChanges(this.item, true, false, oldStatus);
            if (oldStatus === ITEM_STATUS.Deleted) {
                if (!this.getIsDestroyCalled()) {
                   this.destroy();
                }
                return;
            }
            this._origVals = null;
            if (!!this._saveVals)
                this._saveVals = collUtils.cloneVals(this.dbSet.getFieldInfos(), this._vals); //coreUtils.clone(this._vals);
            this._setStatus(ITEM_STATUS.None);
            errors.removeAllErrors(this.item);
            if (!!rowInfo) {
                this._refreshValues(rowInfo, REFRESH_MODE.CommitChanges);
            }
            internal.onCommitChanges(this.item, false, false, oldStatus);
        }
    }
    _onAttaching(): void {
        super._onAttaching();
        this._status = ITEM_STATUS.Added;
    }
    _onAttach(): void {
        super._onAttach();
        if (this.key === null)
            throw new Error(ERRS.ERR_ITEM_IS_DETACHED);
        this.dbSet._getInternal().addToChanged(this.item);
    }
    deleteItem(): boolean {
        return this.deleteOnSubmit();
    }
    deleteOnSubmit(): boolean {
        if (this.getIsDestroyCalled())
            return false;
        const oldStatus = this.status, dbSet = this.dbSet;
        let args: ICancellableArgs<TItem> = { item: this.item, isCancel: false };
        dbSet._getInternal().onItemDeleting(args);
        if (args.isCancel) {
            return false;
        }
        if (oldStatus === ITEM_STATUS.Added) {
            dbSet.removeItem(this.item);
        }
        else {
            this._setStatus(ITEM_STATUS.Deleted);
        }
        return true;
    }
    acceptChanges(): void {
        this._acceptChanges(null);
    }
    rejectChanges(): void {
        if (this.getIsDestroyed())
            return;
        const self = this, oldStatus = self.status, dbSet = self.dbSet, internal = dbSet._getInternal(), errors = dbSet.errors;
        if (oldStatus !== ITEM_STATUS.None) {
            internal.onCommitChanges(self.item, true, true, oldStatus);
            if (oldStatus === ITEM_STATUS.Added) {
                if (!this.getIsDestroyCalled())
                    this.destroy();
                return;
            }

            const changes = self._getValueChanges(true);
            if (!!self._origVals) {
                self._vals = collUtils.cloneVals(self.dbSet.getFieldInfos(), self._origVals); //coreUtils.clone(self._origVals);
                self._origVals = null;
                if (!!self._saveVals) {
                    self._saveVals = collUtils.cloneVals(self.dbSet.getFieldInfos(), self._vals); //coreUtils.clone(self._vals);
                }
            }
            self._setStatus(ITEM_STATUS.None);
            errors.removeAllErrors(this.item);
            changes.forEach((v) => {
                fn_traverseChanges(v, (fullName, vc) => {
                    self._onFieldChanged(fullName, dbSet.getFieldInfo(fullName));
                });
            });
            internal.onCommitChanges(this.item, false, true, oldStatus);
        }
    }
    submitChanges(): IVoidPromise {
        const removeHandler = () => {
            dbxt.removeOnSubmitError(uniqueID);
        }
        const dbxt = this.dbSet.dbContext, uniqueID = coreUtils.uuid();
        dbxt.addOnSubmitError((sender, args) => {
            if (args.error instanceof SubmitError) {
                let submitErr: SubmitError = args.error;
                if (submitErr.notValidated.length > 0) {
                    //don't reject changes,so the user can see errors in the edit dialog
                    args.isHandled = true;
                }
            }
        }, uniqueID);

        const promise = dbxt.submitChanges();
        promise.then(removeHandler, removeHandler);
        return promise;
    }
    refresh(): IPromise<TItem> {
        const dbxt = this.dbSet.dbContext;
        return dbxt._getInternal().refreshItem(this.item);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.cancelEdit();
        this.rejectChanges();
        super.destroy();
    }
    toString() {
        return this.dbSetName + "EntityAspect";
    }
    get srvKey(): string { return this._srvKey; }
    get isCanSubmit(): boolean { return true; }
    get dbSetName() { return this.dbSet.dbSetName; }
    get serverTimezone() { return this.dbSet.dbContext.serverTimezone; }
    get dbSet() { return <DbSet<TItem, TObj, TDbContext>>this.collection; }
}