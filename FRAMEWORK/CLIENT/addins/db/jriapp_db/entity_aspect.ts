/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, DATE_CONVERSION, DATA_TYPE, SORT_ORDER } from "jriapp_core/const";
import { IFieldInfo, IIndexer, IValidationInfo, IVoidPromise, IPromise } from "jriapp_core/shared";
import { ERRS } from "jriapp_core/lang";
import { Utils, SysChecks } from "jriapp_utils/utils";
import { valueUtils, ItemAspect, ITEM_STATUS, fn_traverseFields, ValidationError, ICancellableArgs } from "jriapp_collection/collection";
import { FLAGS, REFRESH_MODE, PROP_NAME } from "const";
import { DbContext } from "dbcontext";
import { IEntityItem, IEntityConstructor, IRowData, IFieldName, IValueChange, IRowInfo } from "int";
import { DbSet } from "dbset";
import { SubmitError } from "error";

const utils = Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core;

const ENTITYASPECT_EVENTS = {
    destroyed: "destroyed"
};

//don't submit these types of fields to the server
function fn_isNotSubmittable(fieldInfo: IFieldInfo) {
    return (fieldInfo.fieldType === FIELD_TYPE.ClientOnly || fieldInfo.fieldType === FIELD_TYPE.Navigation || fieldInfo.fieldType === FIELD_TYPE.Calculated || fieldInfo.fieldType === FIELD_TYPE.ServerCalculated);
}

function fn_traverseChanges(val: IValueChange, fn: (name: string, val: IValueChange) => void): void {
    function _fn_traverseChanges(name: string, val: IValueChange, fn: (name: string, val: IValueChange) => void) {
        if (!!val.nested && val.nested.length > 0) {
            let prop: IValueChange, i: number, len = val.nested.length;
            for (i = 0; i < len; i += 1) {
                prop = val.nested[i];
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
    _fn_traverseChanges(val.fieldName, val, fn);
}

export interface IEntityAspectConstructor<TItem extends IEntityItem, TDbContext extends DbContext> {
    new (dbSet: DbSet<TItem, TDbContext>, row: IRowData, names: IFieldName[]): EntityAspect<TItem, TDbContext>;
}

export class EntityAspect<TItem extends IEntityItem, TDbContext extends DbContext> extends ItemAspect<TItem> {
    private _srvKey: string;
    private _isRefreshing: boolean;
    private _origVals: IIndexer<any>;
    private _savedStatus: ITEM_STATUS;

    constructor(dbSet: DbSet<TItem, TDbContext>, row: IRowData, names: IFieldName[]) {
        super(dbSet);
        let self = this;
        this._srvKey = null;
        this._isRefreshing = false;
        this._origVals = null;
        this._savedStatus = null;
        let fieldInfos = this.dbSet.getFieldInfos();
        fn_traverseFields<void>(fieldInfos, (fld, fullName) => {
            if (fld.fieldType === FIELD_TYPE.Object)
                coreUtils.setValue(self._vals, fullName, {}, false);
            else
                coreUtils.setValue(self._vals, fullName, null, false);
        });

        this._initRowInfo(row, names);
    }
    protected _fakeDestroy() {
        this.raiseEvent(ENTITYASPECT_EVENTS.destroyed, {});
        this.removeNSHandlers();
    }
    protected _initRowInfo(row: IRowData, names: IFieldName[]) {
        if (!row)
            return;
        this._srvKey = row.k;
        this.key = row.k;

        this._processValues("", row.v, names);
    }
    protected _processValues(path: string, values: any[], names: IFieldName[]) {
        let self = this, stz = self.serverTimezone;
        values.forEach(function (value, index) {
            let name: IFieldName = names[index], fieldName = path + name.n, fld = self.dbSet.getFieldInfo(fieldName), val: any;
            if (!fld)
                throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, fieldName));

            if (fld.fieldType === FIELD_TYPE.Object) {
                //for object fields the value should be an array of values - recursive processing
                self._processValues(fieldName + ".", <any[]>value, name.p);
            }
            else {
                //for other fields the value is a string, which is parsed to a typed value
                val = valueUtils.parseValue(value, fld.dataType, fld.dateConversion, stz);
                coreUtils.setValue(self._vals, fieldName, val, false);
            }
        });
    }
    protected _onFieldChanged(fieldName: string, fieldInfo: IFieldInfo) {
        let self = this;
        if (this._isDestroyCalled)
            return;
        self.item.raisePropertyChanged(fieldName);
        if (!!fieldInfo.dependents && fieldInfo.dependents.length > 0) {
            fieldInfo.dependents.forEach(function (d) {
                self.item.raisePropertyChanged(d);
            });
        }
    }
    protected _getValueChange(fullName: string, fieldInfo: IFieldInfo, changedOnly: boolean): IValueChange {
        let self = this, dbSet = self.dbSet, res: IValueChange, i: number, len: number, tmp: IValueChange;
        if (fn_isNotSubmittable(fieldInfo))
            return <IValueChange>null;

        if (fieldInfo.fieldType === FIELD_TYPE.Object) {
            res = { fieldName: fieldInfo.fieldName, val: null, orig: null, flags: FLAGS.None, nested: [] };
            len = fieldInfo.nested.length;
            for (i = 0; i < len; i += 1) {
                tmp = self._getValueChange(fullName + "." + fieldInfo.nested[i].fieldName, fieldInfo.nested[i], changedOnly);
                if (!!tmp) {
                    res.nested.push(tmp);
                }
            }
        }
        else {
            let newVal = dbSet._getInternal().getStrValue(coreUtils.getValue(self._vals, fullName), fieldInfo),
                oldV = self._origVals === null ? newVal : dbSet._getInternal().getStrValue(coreUtils.getValue(self._origVals, fullName), fieldInfo),
                isChanged = (oldV !== newVal);
            if (isChanged)
                res = { fieldName: fieldInfo.fieldName, val: newVal, orig: oldV, flags: (FLAGS.Changed | FLAGS.Setted), nested: null };
            else if (fieldInfo.isPrimaryKey > 0 || fieldInfo.fieldType === FIELD_TYPE.RowTimeStamp || fieldInfo.isNeedOriginal)
                res = { fieldName: fieldInfo.fieldName, val: newVal, orig: oldV, flags: FLAGS.Setted, nested: null };
            else
                res = { fieldName: fieldInfo.fieldName, val: null, orig: null, flags: FLAGS.None, nested: null };
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
        let self = this, flds = this.dbSet.getFieldInfos();
        let res = flds.map((fld) => {
            return self._getValueChange(fld.fieldName, fld, changedOnly);
        });

        //remove nulls
        let res2 = res.filter((vc) => {
            return !!vc;
        });
        return res2;
    }
    protected _fldChanging(fieldName: string, fieldInfo: IFieldInfo, oldV: any, newV: any) {
        if (!this._origVals) {
            this._origVals = coreUtils.clone(this._vals);
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
        let self = this, changes = this._getValueChanges(true), isNew = this.isNew, dbSet = this.dbSet;
        this._vals = this._saveVals;
        this._saveVals = null;
        this.setStatus(this._savedStatus);
        this._savedStatus = null;
        dbSet._getInternal().removeAllErrors(this.item);
        changes.forEach(function (v) {
            let fld = self.dbSet.getFieldInfo(v.fieldName);
            if (!fld)
                throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, v.fieldName));
            self._onFieldChanged(v.fieldName, fld);
        });
        this._setIsEditing(false);
        if (isNew && this._notEdited) {
            dbSet.removeItem(this.item);
        }
        return true;
    }
    protected getDbSet() {
        return this.dbSet;
    }
    protected setStatus(v: ITEM_STATUS) {
        if (this._status !== v) {
            let oldStatus = this._status;
            this._status = v;
            if (v !== ITEM_STATUS.None)
                this.dbSet._getInternal().addToChanged(this.item);
            else
                this.dbSet._getInternal().removeFromChanged(this.key);
            this.dbSet._getInternal().onItemStatusChanged(this.item, oldStatus);
        }
    }
    protected getSrvKey(): string { return this._srvKey; }
    _updateKeys(srvKey: string) {
        this._srvKey = srvKey;
        this.key = srvKey;
    }
    _checkCanRefresh() {
        if (this.key === null || this.status === ITEM_STATUS.Added) {
            throw new Error(ERRS.ERR_OPER_REFRESH_INVALID);
        }
    }
    _refreshValue(val: any, fullName: string, refreshMode: REFRESH_MODE) {
        let self = this, fld = self.dbSet.getFieldInfo(fullName);
        if (!fld)
            throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, fullName));
        let stz = self.serverTimezone, newVal: any, oldVal: any, oldValOrig: any, dataType = fld.dataType, dcnv = fld.dateConversion;
        newVal = valueUtils.parseValue(val, dataType, dcnv, stz);
        oldVal = coreUtils.getValue(self._vals, fullName);
        switch (refreshMode) {
            case REFRESH_MODE.CommitChanges:
                {
                    if (!valueUtils.compareVals(newVal, oldVal, dataType)) {
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
                    if (!valueUtils.compareVals(newVal, oldVal, dataType)) {
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
                    if (oldValOrig === checks.undefined || valueUtils.compareVals(oldValOrig, oldVal, dataType)) {
                        //unmodified
                        if (!valueUtils.compareVals(newVal, oldVal, dataType)) {
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
        let self = this, oldStatus = this.status;
        if (!this._isDestroyed) {
            if (!refreshMode) {
                refreshMode = REFRESH_MODE.RefreshCurrent;
            }
            rowInfo.values.forEach(function (val) {
                fn_traverseChanges(val, (fullName, vc) => {
                    if (!((vc.flags & FLAGS.Refreshed) === FLAGS.Refreshed))
                        return;
                    self._refreshValue(vc.val, fullName, refreshMode);
                });
            });

            if (oldStatus === ITEM_STATUS.Updated) {
                let changes = this._getValueChanges(true);
                if (changes.length === 0) {
                    this._origVals = null;
                    this.setStatus(ITEM_STATUS.None);
                }
            }
        }
    }
    _getRowInfo() {
        let res: IRowInfo = {
            values: this._getValueChanges(false),
            changeType: this.status,
            serverKey: this.getSrvKey(),
            clientKey: this.key,
            error: null
        };
        return res;
    }
    _getCalcFieldVal(fieldName: string) {
        if (this._isDestroyCalled)
            return null;
        return this.dbSet._getInternal().getCalcFieldVal(fieldName, this.item);
    }
    _getNavFieldVal(fieldName: string) {
        if (this._isDestroyCalled) {
            return null;
        }
        return this.dbSet._getInternal().getNavFieldVal(fieldName, this.item);
    }
    _setNavFieldVal(fieldName: string, value: any) {
        let dbSet = this.dbSet
        dbSet._getInternal().setNavFieldVal(fieldName, this.item, value)
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
        let validation_error: IValidationInfo, error: any, dbSetName = this.dbSetName, dbSet = this.dbSet,
            oldV = this._getFieldVal(fieldName), newV = val, fieldInfo = this.getFieldInfo(fieldName), res = false;
        if (!fieldInfo)
            throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, dbSetName, fieldName));
        if (!this.isEditing && !this.isUpdating)
            this.beginEdit();
        try {
            newV = this._checkVal(fieldInfo, newV);
            if (oldV !== newV) {
                if (this._fldChanging(fieldName, fieldInfo, oldV, newV)) {
                    coreUtils.setValue(this._vals, fieldName, newV, false);
                    if (!(fieldInfo.fieldType === FIELD_TYPE.ClientOnly || fieldInfo.fieldType === FIELD_TYPE.ServerCalculated)) {
                        switch (this.status) {
                            case ITEM_STATUS.None:
                                this.setStatus(ITEM_STATUS.Updated);
                                break;
                        }
                    }
                    this._onFieldChanged(fieldName, fieldInfo);
                    res = true;
                }
            }
            dbSet._getInternal().removeError(this.item, fieldName);
            validation_error = this._validateField(fieldName);
            if (!!validation_error) {
                throw new ValidationError([validation_error], this);
            }
        } catch (ex) {
            if (SysChecks._isValidationError(ex)) {
                error = ex;
            }
            else {
                error = new ValidationError([
                    { fieldName: fieldName, errors: [ex.message] }
                ], this);
            }
            dbSet._getInternal().addError(this.item, fieldName, error.errors[0].errors);
            throw error;
        }
        return res;
    }
    _acceptChanges(rowInfo?: IRowInfo): void {
        let oldStatus = this.status, dbSet = this.dbSet, internal = dbSet._getInternal();
        if (this.key === null)
            return;
        if (oldStatus !== ITEM_STATUS.None) {
            internal.onCommitChanges(this.item, true, false, oldStatus);
            if (oldStatus === ITEM_STATUS.Deleted) {
                this.destroy();
                return;
            }
            this._origVals = null;
            if (!!this._saveVals)
                this._saveVals = coreUtils.clone(this._vals);
            this.setStatus(ITEM_STATUS.None);
            internal.removeAllErrors(this.item);
            if (!!rowInfo)
                this._refreshValues(rowInfo, REFRESH_MODE.CommitChanges);
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
        let oldStatus = this.status, dbSet = this.dbSet, args: ICancellableArgs<TItem> = { item: this.item, isCancel: false };
        dbSet._getInternal().onItemDeleting(args);
        if (args.isCancel) {
            return false;
        }
        if (this.key === null)
            return false;
        if (oldStatus === ITEM_STATUS.Added) {
            dbSet.removeItem(this.item);
            return true;
        }
        this.setStatus(ITEM_STATUS.Deleted);
        return true;
    }
    acceptChanges(): void {
        this._acceptChanges(null);
    }
    rejectChanges(): void {
        let self = this, oldStatus = self.status, dbSet = self.dbSet, internal = dbSet._getInternal();
        if (!self.key)
            return;
        if (oldStatus !== ITEM_STATUS.None) {
            internal.onCommitChanges(self.item, true, true, oldStatus);
            if (oldStatus === ITEM_STATUS.Added) {
                this.destroy();
                return;
            }

            let changes = self._getValueChanges(true);
            if (!!self._origVals) {
                self._vals = coreUtils.clone(self._origVals);
                self._origVals = null;
                if (!!self._saveVals) {
                    self._saveVals = coreUtils.clone(self._vals);
                }
            }
            self.setStatus(ITEM_STATUS.None);
            internal.removeAllErrors(this.item);
            changes.forEach(function (v) {
                fn_traverseChanges(v, (fullName, vc) => {
                    self._onFieldChanged(fullName, dbSet.getFieldInfo(fullName));
                });
            });
            internal.onCommitChanges(this.item, false, true, oldStatus);
        }
    }
    submitChanges(): IVoidPromise {
        function removeHandler() {
            dbxt.removeOnSubmitError(uniqueID);
        }
        let dbxt = this.dbSet.dbContext, uniqueID = coreUtils.uuid();
        dbxt.addOnSubmitError(function (sender, args) {
            if (args.error instanceof SubmitError) {
                let submitErr: SubmitError = args.error;
                if (submitErr.notValidated.length > 0) {
                    //don't reject changes,so the user can see errors in the edit dialog
                    args.isHandled = true;
                }
            }
        }, uniqueID);

        let promise = dbxt.submitChanges();
        promise.then(removeHandler, removeHandler);
        return promise;
    }
    refresh(): IPromise<TItem> {
        let dbxt = this.dbSet.dbContext;
        return dbxt._getInternal().refreshItem(this.item);
    }
    toString() {
        return this.dbSetName + "EntityAspect";
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let item = this.item;
        if (!!item && this.isCached) {
            try {
                if (!item.getIsDestroyCalled())
                    item.destroy();
                this._fakeDestroy();
            }
            finally {
                this._isDestroyCalled = false;
            }
            return;
        }
        this.dbSet._getInternal().removeFromChanged(this.key);
        this._srvKey = null;
        this._origVals = null;
        this._savedStatus = null;
        this._isRefreshing = false;
        super.destroy();
    }
    get entityType() { return this.dbSet.entityType; }
    get isCanSubmit(): boolean { return true; }
    get isNew(): boolean { return this._status === ITEM_STATUS.Added; }
    get isDeleted(): boolean { return this._status === ITEM_STATUS.Deleted; }
    get dbSetName() { return this.dbSet.dbSetName; }
    get serverTimezone() { return this.dbSet.dbContext.serverTimezone; }
    get dbSet() { return <DbSet<TItem, TDbContext>>this.collection; }
    get isRefreshing(): boolean { return this._isRefreshing; }
    set isRefreshing(v: boolean) {
        if (this._isRefreshing !== v) {
            this._isRefreshing = v;
            this.raisePropertyChanged(PROP_NAME.isRefreshing);
        }
    }
}