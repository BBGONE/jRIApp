/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    DATE_CONVERSION, DATA_TYPE, FIELD_TYPE, SORT_ORDER,
    ITEM_STATUS, COLL_CHANGE_REASON, COLL_CHANGE_TYPE, COLL_CHANGE_OPER
} from "./const";
import { IFieldInfo } from "./int";
import { IPromise } from "../iasync";
import {
    IIndexer, IValidationInfo, TEventHandler, TPropChangedHandler,
    IBaseObject, TPriority
} from "../int";
import { BaseObject }  from "../object";
import { ERRS } from "../lang";
import { WaitQueue } from "../utils/waitqueue";
import { Utils } from "../utils/utils";

import { ICollectionItem, ICollection, ICollectionOptions, IPermissions, IInternalCollMethods, ICollChangedArgs,
    ICancellableArgs, ICollFillArgs, ICollEndEditArgs, ICollItemAddedArgs, ICollectionEvents, ICollItemArgs, ICollItemStatusArgs,
    ICollValidateArgs, ICurrentChangingArgs, ICommitChangesArgs, IItemAddedArgs, IPageChangingArgs,
    IErrorsList, IErrors, PROP_NAME } from "./int";
import { valueUtils, fn_getPropertyByName } from "./utils";
import { ValidationError } from "./validation";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, sys = utils.sys;

//REPLACE DUMMY IMPLEMENTATIONS
sys.isCollection = (obj) => { return (!!obj && obj instanceof BaseCollection); };

const COLL_EVENTS = {
    begin_edit: "begin_edit",
    end_edit: "end_edit",
    before_begin_edit: "before_be",
    before_end_edit: "before_ee",
    collection_changed: "coll_changed",
    fill: "fill",
    item_deleting: "item_deleting",
    item_adding: "item_adding",
    item_added: "item_added",
    validate: "validate",
    current_changing: "current_changing",
    page_changing: "page_changing",
    errors_changed: "errors_changed",
    status_changed: "status_changed",
    clearing: "clearing",
    cleared: "cleared",
    commit_changes: "commit_changes"
};

export class BaseCollection<TItem extends ICollectionItem> extends BaseObject implements ICollection<TItem> {
    protected _options: ICollectionOptions;
    protected _isLoading: boolean;
    protected _EditingItem: TItem;
    protected _perms: IPermissions;
    protected _totalCount: number;
    protected _pageIndex: number;
    protected _items: TItem[];
    protected _itemsByKey: IIndexer<TItem>;
    protected _currentPos: number;
    protected _newKey: number;
    protected _fieldMap: IIndexer<IFieldInfo>;
    protected _fieldInfos: IFieldInfo[];
    protected _errors: IErrorsList;
    protected _ignoreChangeErrors: boolean;
    protected _pkInfo: IFieldInfo[];
    protected _isUpdating: boolean;
    protected _waitQueue: WaitQueue;
    protected _internal: IInternalCollMethods<TItem>;

    constructor() {
        super();
        let self = this;
        this._options = { enablePaging: false, pageSize: 50 };
        this._isLoading = false;
        this._isUpdating = false;

        this._EditingItem = null;
        this._perms = { canAddRow: true, canEditRow: true, canDeleteRow: true, canRefreshRow: false };
        //includes stored on server
        this._totalCount = 0;
        this._pageIndex = 0;
        this._items = [];
        this._itemsByKey = {};
        this._currentPos = -1;
        this._newKey = 0;
        this._fieldMap = {};
        this._fieldInfos = [];
        this._errors = {};
        this._ignoreChangeErrors = false;
        this._pkInfo = null;
        this._waitQueue = new WaitQueue(this);
        this._internal = {
            getEditingItem: () => {
                return self._getEditingItem();
            },
            getStrValue: (val: any, fieldInfo: IFieldInfo) => {
                return self._getStrValue(val, fieldInfo);
            },
            onBeforeEditing: (item: TItem, isBegin: boolean, isCanceled: boolean) => {
                self._onBeforeEditing(item, isBegin, isCanceled);
            },
            onEditing: (item: TItem, isBegin: boolean, isCanceled: boolean) => {
                self._onEditing(item, isBegin, isCanceled);
            },
            onCommitChanges: (item: TItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS) => {
                self._onCommitChanges(item, isBegin, isRejected, status);
            },
            validateItem: (item: TItem) => {
                return self._validateItem(item);
            },
            validateItemField: (item: TItem, fieldName: string) => {
                return self._validateItemField(item, fieldName);
            },
            addErrors: (item: TItem, errors: IValidationInfo[]) => {
                self._addErrors(item, errors);
            },
            addError: (item: TItem, fieldName: string, errors: string[]) => {
                self._addError(item, fieldName, errors);
            },
            removeError: (item: TItem, fieldName: string) => {
                self._removeError(item, fieldName);
            },
            removeAllErrors: (item: TItem) => {
                self._removeAllErrors(item);
            },
            getErrors: (item: TItem) => {
                return self._getErrors(item);
            },
            onErrorsChanged: (item: TItem) => {
                self._onErrorsChanged(item);
            },
            onItemDeleting: (args: ICancellableArgs<TItem>) => {
                return self._onItemDeleting(args);
            }
        };
    }
    static getEmptyFieldInfo(fieldName: string) {
        let fieldInfo: IFieldInfo = {
            fieldName: fieldName,
            isPrimaryKey: 0,
            dataType: DATA_TYPE.None,
            isNullable: true,
            maxLength: -1,
            isReadOnly: false,
            isAutoGenerated: false,
            allowClientDefault: false,
            dateConversion: DATE_CONVERSION.None,
            fieldType: FIELD_TYPE.ClientOnly,
            isNeedOriginal: false,
            range: null,
            regex: null,
            nested: null,
            dependentOn: null,
            fullName: null
        };
        return fieldInfo;
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        let events = Object.keys(COLL_EVENTS).map((key, i, arr) => { return <string>(<any>COLL_EVENTS)[key]; });
        return events.concat(base_events);
    }
    addOnClearing(fn: TEventHandler<ICollection<TItem>, { reason: COLL_CHANGE_REASON; }>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.clearing, fn, nmspace, context, priority);
    }
    removeOnClearing(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.clearing, nmspace);
    }
    addOnCleared(fn: TEventHandler<ICollection<TItem>, { reason: COLL_CHANGE_REASON; }>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.cleared, fn, nmspace, context, priority);
    }
    removeOnCleared(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.cleared, nmspace);
    }
    addOnCollChanged(fn: TEventHandler<ICollection<TItem>, ICollChangedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.collection_changed, fn, nmspace, context, priority);
    }
    removeOnCollChanged(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.collection_changed, nmspace);
    }
    addOnFill(fn: TEventHandler<ICollection<TItem>, ICollFillArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.fill, fn, nmspace, context, priority);
    }
    removeOnFill(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.fill, nmspace);
    }
    addOnValidate(fn: TEventHandler<ICollection<TItem>, ICollValidateArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.validate, fn, nmspace, context, priority);
    }
    removeOnValidate(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.validate, nmspace);
    }
    addOnItemDeleting(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.item_deleting, fn, nmspace, context, priority);
    }
    removeOnItemDeleting(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.item_deleting, nmspace);
    }
    addOnItemAdding(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.item_adding, fn, nmspace, context, priority);
    }
    removeOnItemAdding(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.item_adding, nmspace);
    }
    addOnItemAdded(fn: TEventHandler<ICollection<TItem>, IItemAddedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.item_added, fn, nmspace, context, priority);
    }
    removeOnItemAdded(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.item_added, nmspace);
    }
    addOnCurrentChanging(fn: TEventHandler<ICollection<TItem>, ICurrentChangingArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.current_changing, fn, nmspace, context, priority);
    }
    removeOnCurrentChanging(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.current_changing, nmspace);
    }
    addOnPageChanging(fn: TEventHandler<ICollection<TItem>, IPageChangingArgs>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.page_changing, fn, nmspace, context, priority);
    }
    removeOnPageChanging(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.page_changing, nmspace);
    }
    addOnErrorsChanged(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.errors_changed, fn, nmspace, context, priority);
    }
    removeOnErrorsChanged(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.errors_changed, nmspace);
    }
    addOnBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.begin_edit, fn, nmspace, context, priority);
    }
    removeOnBeginEdit(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.begin_edit, nmspace);
    }
    addOnEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.end_edit, fn, nmspace, context, priority);
    }
    removeOnEndEdit(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.end_edit, nmspace);
    }
    addOnBeforeBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.before_begin_edit, fn, nmspace, context, priority);
    }
    removeOnBeforeBeginEdit(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.before_begin_edit, nmspace);
    }
    addOnBeforeEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.before_end_edit, fn, nmspace, context, priority);
    }
    removeBeforeOnEndEdit(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.before_end_edit, nmspace);
    }
    addOnCommitChanges(fn: TEventHandler<ICollection<TItem>, ICommitChangesArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.commit_changes, fn, nmspace, context, priority);
    }
    removeOnCommitChanges(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.commit_changes, nmspace);
    }
    addOnStatusChanged(fn: TEventHandler<ICollection<TItem>, ICollItemStatusArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(COLL_EVENTS.status_changed, fn, nmspace, context, priority);
    }
    removeOnStatusChanged(nmspace?: string) {
        this._removeHandler(COLL_EVENTS.status_changed, nmspace);
    }
    addOnPageIndexChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        this.addOnPropertyChange(PROP_NAME.pageIndex, handler, nmspace, context);
    }
    addOnPageSizeChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        this.addOnPropertyChange(PROP_NAME.pageSize, handler, nmspace, context);
    }
    addOnTotalCountChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        this.addOnPropertyChange(PROP_NAME.totalCount, handler, nmspace, context);
    }
    addOnCurrentChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        this.addOnPropertyChange(PROP_NAME.currentItem, handler, nmspace, context);
    }
    protected _getPKFieldInfos(): IFieldInfo[] {
        if (!!this._pkInfo)
            return this._pkInfo;
        let fldMap = this._fieldMap, pk: IFieldInfo[] = [];
        coreUtils.forEachProp(fldMap, function (fldName) {
            if (fldMap[fldName].isPrimaryKey > 0) {
                pk.push(fldMap[fldName]);
            }
        });
        pk.sort(function (a, b) {
            return a.isPrimaryKey - b.isPrimaryKey;
        });
        this._pkInfo = pk;
        return this._pkInfo;
    }
    protected _checkCurrentChanging(newCurrent: TItem) {
        try {
            this.endEdit();
        } catch (ex) {
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
    }
    protected _onCurrentChanging(newCurrent: TItem) {
        this._checkCurrentChanging(newCurrent);
        this.raiseEvent(COLL_EVENTS.current_changing, <ICurrentChangingArgs<TItem>>{ newCurrent: newCurrent });
    }
    protected _onCurrentChanged() {
        this.raisePropertyChanged(PROP_NAME.currentItem);
    }
    protected _onCountChanged() {
        this.raisePropertyChanged(PROP_NAME.count);
    }
    protected _onEditingChanged() {
        this.raisePropertyChanged(PROP_NAME.isEditing);
    }
    //occurs when item status Changed (not used in simple collections)
    protected _onItemStatusChanged(item: TItem, oldStatus: ITEM_STATUS) {
        this.raiseEvent(COLL_EVENTS.status_changed, <ICollItemStatusArgs<TItem>>{ item: item, oldStatus: oldStatus, key: item._key });
    }
    protected _onCollectionChanged(args: ICollChangedArgs<TItem>) {
        this.raiseEvent(COLL_EVENTS.collection_changed, args);
    }
    protected _onFillEnd(args: ICollFillArgs<TItem>) {
        this.raiseEvent(COLL_EVENTS.fill, args);
    }
    //new item is being added, but is not in the collection now
    protected _onItemAdding(item: TItem) {
        let args: ICancellableArgs<TItem> = { item: item, isCancel: false };
        this.raiseEvent(COLL_EVENTS.item_adding, args);
        if (args.isCancel)
            utils.err.throwDummy(new Error("operation canceled"));
    }
    //new item has been added and now is in editing state and is currentItem
    protected _onItemAdded(item: TItem) {
        let args: IItemAddedArgs<TItem> = { item: item, isAddNewHandled: false };
        this.raiseEvent(COLL_EVENTS.item_added, args);
    }
    protected _createNew(): TItem {
        throw new Error("_createNew Not implemented");
    }
    protected _attach(item: TItem, itemPos?: number) {
        if (!!this._itemsByKey[item._key]) {
            throw new Error(ERRS.ERR_ITEM_IS_ATTACHED);
        }
        try {
            this.endEdit();
        } catch (ex) {
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
        let pos: number;
        item._aspect._onAttaching();
        if (checks.isNt(itemPos)) {
            pos = this._items.length;
            this._items.push(item);
        }
        else {
            pos = itemPos;
            utils.arr.insert(this._items, item, pos);
        }
        this._itemsByKey[item._key] = item;
        this._onCollectionChanged({ changeType: COLL_CHANGE_TYPE.Add, reason: COLL_CHANGE_REASON.None, oper: COLL_CHANGE_OPER.Attach, items: [item], pos: [pos] });
        item._aspect._onAttach();
        this.raisePropertyChanged(PROP_NAME.count);
        this._onCurrentChanging(item);
        this._currentPos = pos;
        this._onCurrentChanged();
        return pos;
    }
    protected _onRemoved(item: TItem, pos: number) {
        try {
            this._onCollectionChanged({ changeType: COLL_CHANGE_TYPE.Remove, reason: COLL_CHANGE_REASON.None, oper: COLL_CHANGE_OPER.Remove, items: [item], pos: [pos] });
        }
        finally {
            this.raisePropertyChanged(PROP_NAME.count);
        }
    }
    protected _onPageSizeChanged() {
    }
    protected _onPageChanging() {
        let args: IPageChangingArgs = { page: this.pageIndex, isCancel: false };
        this.raiseEvent(COLL_EVENTS.page_changing, args);
        if (!args.isCancel) {
            try {
                this.endEdit();
            } catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        }
        return !args.isCancel;
    }
    protected _onPageChanged() {
    }
    protected _setCurrentItem(v: TItem) {
        let self = this, oldPos = self._currentPos;
        if (!v) {
            if (oldPos !== -1) {
                self._onCurrentChanging(null);
                self._currentPos = -1;
                self._onCurrentChanged();
            }
            return;
        }
        if (!v._key)
            throw new Error(ERRS.ERR_ITEM_IS_DETACHED);
        let oldItem: TItem, pos: number, item = self.getItemByKey(v._key);
        if (!item) {
            throw new Error(ERRS.ERR_ITEM_IS_NOTFOUND);
        }
        oldItem = self.getItemByPos(oldPos);
        pos = self._items.indexOf(v);
        if (pos < 0) {
            throw new Error(ERRS.ERR_ITEM_IS_NOTFOUND);
        }
        if (oldPos !== pos || oldItem !== v) {
            self._onCurrentChanging(v);
            self._currentPos = pos;
            self._onCurrentChanged();
        }
    }
    protected _destroyItems() {
        this._items.forEach(function (item) {
            item._aspect._setIsDetached(true);
            item.destroy();
        });
    }
    //override
    _isHasProp(prop: string) {
        //first check for indexed property name
        if (strUtils.startsWith(prop, "[")) {
            let res = sys.getProp(this, prop);
            return !checks.isUndefined(res);
        }
        return super._isHasProp(prop);
    }
    protected _getEditingItem() {
        return this._EditingItem;
    }
    protected _getStrValue(val: any, fieldInfo: IFieldInfo): string {
        let dcnv = fieldInfo.dateConversion, stz = coreUtils.get_timeZoneOffset();
        return valueUtils.stringifyValue(val, dcnv, fieldInfo.dataType, stz);
    }
    protected _onBeforeEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void {
        if (this._isUpdating)
            return;
        if (isBegin) {
            this.raiseEvent(COLL_EVENTS.before_begin_edit, <ICollItemArgs<TItem>>{ item: item });
        }
        else {
            this.raiseEvent(COLL_EVENTS.before_end_edit, { item: item, isCanceled: isCanceled });
        }
    }
    protected _onEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void {
        if (this._isUpdating)
            return;
        if (isBegin) {
            this._EditingItem = item;
            this.raiseEvent(COLL_EVENTS.begin_edit, <ICollItemArgs<TItem>>{ item: item });
            this._onEditingChanged();
            if (!!item) {
                item._aspect.raisePropertyChanged(PROP_NAME.isEditing);
            }
        }
        else {
            let oldItem = this._EditingItem;
            this._EditingItem = null;
            this.raiseEvent(COLL_EVENTS.end_edit, { item: item, isCanceled: isCanceled });
            this._onEditingChanged();
            if (!!oldItem) {
                oldItem._aspect.raisePropertyChanged(PROP_NAME.isEditing);
            }
        }
    }
    //used by descendants when commiting submits for items
    protected _onCommitChanges(item: TItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void {
        this.raiseEvent(COLL_EVENTS.commit_changes, <ICommitChangesArgs<TItem>>{ item: item, isBegin: isBegin, isRejected: isRejected, status: status });
    }
    protected _validateItem(item: TItem): IValidationInfo {
        let args: ICollValidateArgs<TItem> = { item: item, fieldName: null, errors: [] };
        this.raiseEvent(COLL_EVENTS.validate, args);
        if (!!args.errors && args.errors.length > 0)
            return { fieldName: null, errors: args.errors };
        else
            return null;
    }
    protected _validateItemField(item: TItem, fieldName: string): IValidationInfo {
        let args: ICollValidateArgs<TItem> = { item: item, fieldName: fieldName, errors: [] };
        this.raiseEvent(COLL_EVENTS.validate, args);
        if (!!args.errors && args.errors.length > 0)
            return { fieldName: fieldName, errors: args.errors };
        else
            return null;
    }
    protected _addErrors(item: TItem, errors: IValidationInfo[]): void {
        let self = this;
        this._ignoreChangeErrors = true;
        try {
            errors.forEach(function (err) {
                self._addError(item, err.fieldName, err.errors);
            });
        } finally {
            this._ignoreChangeErrors = false;
        }
        this._onErrorsChanged(item);
    }
    protected _addError(item: TItem, fieldName: string, errors: string[]): void {
        if (!fieldName)
            fieldName = "*";
        if (!(checks.isArray(errors) && errors.length > 0)) {
            this._removeError(item, fieldName);
            return;
        }
        if (!this._errors[item._key])
            this._errors[item._key] = {};
        let itemErrors = this._errors[item._key];
        itemErrors[fieldName] = errors;
        if (!this._ignoreChangeErrors)
            this._onErrorsChanged(item);
    }
    protected _removeError(item: TItem, fieldName: string): void {
        let itemErrors = this._errors[item._key];
        if (!itemErrors)
            return;
        if (!fieldName)
            fieldName = "*";
        if (!itemErrors[fieldName])
            return;
        delete itemErrors[fieldName];
        if (Object.keys(itemErrors).length === 0) {
            delete this._errors[item._key];
        }
        this._onErrorsChanged(item);
    }
    protected _removeAllErrors(item: TItem): void {
        let self = this, itemErrors = this._errors[item._key];
        if (!itemErrors)
            return;
        delete this._errors[item._key];
        self._onErrorsChanged(item);
    }
    protected _getErrors(item: TItem): IErrors {
        return this._errors[item._key];
    }
    protected _onErrorsChanged(item: TItem): void {
        let args: ICollItemArgs<TItem> = { item: item };
        this.raiseEvent(COLL_EVENTS.errors_changed, args);
        item._aspect.raiseErrorsChanged({});
    }
    protected _onItemDeleting(args: ICancellableArgs<TItem>): boolean {
        this.raiseEvent(COLL_EVENTS.item_deleting, args);
        return !args.isCancel;
    }
    protected _clear(reason: COLL_CHANGE_REASON, oper: COLL_CHANGE_OPER) {
        this.raiseEvent(COLL_EVENTS.clearing, { reason: reason });
        this.cancelEdit();
        this._EditingItem = null;
        this._newKey = 0;
        this.currentItem = null;
        this._destroyItems();
        this._items = [];
        this._itemsByKey = {};
        this._errors = {};
        if (oper !== COLL_CHANGE_OPER.Fill)
            this._onCollectionChanged({ changeType: COLL_CHANGE_TYPE.Reset, reason: reason, oper: oper, items: [], pos: [] });
        this.raiseEvent(COLL_EVENTS.cleared, { reason: reason });
        this._onCountChanged();
    }
    _setIsLoading(v: boolean) {
        if (this._isLoading !== v) {
            this._isLoading = v;
            this.raisePropertyChanged(PROP_NAME.isLoading);
        }
    }
    _getInternal(): IInternalCollMethods<TItem> {
        return this._internal;
    }
    _getSortFn(fieldNames: string[], sortOrder: SORT_ORDER): (a: any, b: any) => number {
        let self = this, mult = 1;
        if (sortOrder === SORT_ORDER.DESC)
            mult = -1;
        let fn_sort = function (a: any, b: any): number {
            let res = 0, i: number, len: number, af: any, bf: any, fieldName: string;
            for (i = 0, len = fieldNames.length; i < len; i += 1) {
                fieldName = fieldNames[i];
                af = sys.resolvePath(a, fieldName);
                bf = sys.resolvePath(b, fieldName);
                if (af === checks.undefined)
                    af = null;
                if (bf === checks.undefined)
                    bf = null;

                if (af === null && bf !== null)
                    res = -1 * mult;
                else if (af !== null && bf === null)
                    res = mult;
                else if (af < bf)
                    res = -1 * mult;
                else if (af > bf)
                    res = mult;
                else
                    res = 0;

                if (res !== 0)
                    return res;
            }
            return res;
        };
        return fn_sort;
    }
    getFieldInfo(fieldName: string): IFieldInfo {
        const parts = fieldName.split(".");
        let fld = this._fieldMap[parts[0]];
        if (parts.length === 1) {
            return fld;
        }

        if (fld.fieldType === FIELD_TYPE.Object) {
            for (let i = 1; i < parts.length; i += 1) {
                fld = fn_getPropertyByName(parts[i], fld.nested);
            }
            return fld;
        }
        
        throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "fieldName", fieldName));
    }
    getFieldNames(): string[] {
        return this.getFieldInfos().map((f) => {
            return f.fieldName;
        });
    }
    getFieldInfos(): IFieldInfo[] {
        return this._fieldInfos;
    }
    cancelEdit() {
        if (this.isEditing) {
            this._EditingItem._aspect.cancelEdit();
        }
    }
    endEdit() {
        let EditingItem: TItem;
        if (this.isEditing) {
            EditingItem = this._EditingItem;
            if (!EditingItem._aspect.endEdit() && EditingItem._aspect.getIsHasErrors()) {
                this.handleError(new ValidationError(EditingItem._aspect.getAllErrors(), EditingItem), EditingItem);
                this.cancelEdit();
            }
        }
    }
    getItemsWithErrors(): TItem[] {
        let self = this, res: TItem[] = [];
        coreUtils.forEachProp(this._errors, function (key) {
            let item = self.getItemByKey(key);
            res.push(item);
        });
        return res;
    }
    addNew() {
        let item: TItem, isHandled: boolean;
        item = this._createNew();
        this._onItemAdding(item);
        this._attach(item, null);
        try {
            this.currentItem = item;
            item._aspect.beginEdit();
            this._onItemAdded(item);
        }
        catch (ex) {
            isHandled = this.handleError(ex, this);
            item._aspect.cancelEdit();
            utils.err.reThrow(ex, isHandled);
        }
        return item;
    }
    getItemByPos(pos: number): TItem {
        if (pos < 0 || pos >= this._items.length)
            return null;
        return this._items[pos];
    }
    getItemByKey(key: string): TItem {
        if (!key)
            throw new Error(ERRS.ERR_KEY_IS_EMPTY);
        return this._itemsByKey["" + key];
    }
    findByPK(...vals: any[]): TItem {
        if (arguments.length === 0)
            return null;
        let self = this, pkInfo = self._getPKFieldInfos(), arr: string[] = [], key: string, values: any[] = [];
        if (vals.length === 1 && checks.isArray(vals[0])) {
            values = vals[0];
        }
        else
            values = vals;
        if (values.length !== pkInfo.length) {
            return null;
        }
        for (let i = 0, len = pkInfo.length; i < len; i += 1) {
            arr.push(self._getStrValue(values[i], pkInfo[i]));
        }

        key = arr.join(";");
        return self.getItemByKey(key);
    }
    moveFirst(skipDeleted?: boolean): boolean {
        let pos = 0, old = this._currentPos;
        if (old === pos)
            return false;
        let item = this.getItemByPos(pos);
        if (!item)
            return false;
        if (!!skipDeleted) {
            if (item._aspect.isDeleted) {
                return this.moveNext(true);
            }
        }
        this._onCurrentChanging(item);
        this._currentPos = pos;
        this._onCurrentChanged();
        return true;
    }
    movePrev(skipDeleted?: boolean): boolean {
        let pos = -1, old = this._currentPos;
        let item = this.getItemByPos(old);
        if (!!item) {
            pos = old;
            pos -= 1;
        }
        item = this.getItemByPos(pos);
        if (!item)
            return false;
        if (!!skipDeleted) {
            if (item._aspect.isDeleted) {
                this._currentPos = pos;
                return this.movePrev(true);
            }
        }
        this._onCurrentChanging(item);
        this._currentPos = pos;
        this._onCurrentChanged();
        return true;
    }
    moveNext(skipDeleted?: boolean): boolean {
        let pos = -1, old = this._currentPos;
        let item = this.getItemByPos(old);
        if (!!item) {
            pos = old;
            pos += 1;
        }
        item = this.getItemByPos(pos);
        if (!item)
            return false;
        if (!!skipDeleted) {
            if (item._aspect.isDeleted) {
                this._currentPos = pos;
                return this.moveNext(true);
            }
        }
        this._onCurrentChanging(item);
        this._currentPos = pos;
        this._onCurrentChanged();
        return true;
    }
    moveLast(skipDeleted?: boolean): boolean {
        let pos = this._items.length - 1, old = this._currentPos;
        if (old === pos)
            return false;
        let item = this.getItemByPos(pos);
        if (!item)
            return false;
        if (!!skipDeleted) {
            if (item._aspect.isDeleted) {
                return this.movePrev(true);
            }
        }
        this._onCurrentChanging(item);
        this._currentPos = pos;
        this._onCurrentChanged();
        return true;
    }
    goTo(pos: number): boolean {
        let old = this._currentPos;
        if (old === pos)
            return false;
        let item = this.getItemByPos(pos);
        if (!item)
            return false;
        this._onCurrentChanging(item);
        this._currentPos = pos;
        this._onCurrentChanged();
        return true;
    }
    forEach(callback: (item: TItem) => void, thisObj?: any) {
        this._items.forEach(callback, thisObj);
    }
    removeItem(item: TItem) {
        if (item._aspect.isDetached || !this._itemsByKey[item._key]) {
            return;
        }
        try {
            const oldPos = utils.arr.remove(this._items, item), key = item._key;
            if (oldPos < 0) {
                throw new Error(ERRS.ERR_ITEM_IS_NOTFOUND);
            }
            this._onRemoved(item, oldPos);
            delete this._itemsByKey[key];
            delete this._errors[key];
            item._aspect._setIsDetached(true);

            const test = this.getItemByPos(oldPos), curPos = this._currentPos;

            //if detached item was current item
            if (curPos === oldPos) {
                if (!test) { //it was the last item
                    this._currentPos = curPos - 1;
                }
                this._onCurrentChanged();
            }

            if (curPos > oldPos) {
                this._currentPos = curPos - 1;
                this._onCurrentChanged();
            }
        }
        finally {
            if (!item.getIsDestroyCalled()) {
                item.destroy();
            }
        }
    }
    getIsHasErrors(): boolean {
        if (!this._errors)
            return false;
        return (Object.keys(this._errors).length > 0);
    }
    sort(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any> {
        return this.sortLocal(fieldNames, sortOrder);
    }
    sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any> {
        let sortFn = this._getSortFn(fieldNames, sortOrder);
        let self = this, deferred = utils.defer.createDeferred<void>();
        this.waitForNotLoading(() => {
            let cur = self.currentItem;
            self._setIsLoading(true);
            try {
                self._items.sort(sortFn);
                self._onCollectionChanged({ changeType: COLL_CHANGE_TYPE.Reset, reason: COLL_CHANGE_REASON.Sorting, oper: COLL_CHANGE_OPER.Sort, items: [], pos: [] });
            } finally {
                self._setIsLoading(false);
                deferred.resolve();
            }
            self.currentItem = null;
            self.currentItem = cur;
        }, "sorting");

        return deferred.promise();
    }
    clear() {
        this._clear(COLL_CHANGE_REASON.None, COLL_CHANGE_OPER.None);
        this.totalCount = 0;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._waitQueue.destroy();
        this._waitQueue = null;
        this.clear();
        this._fieldMap = {};
        this._fieldInfos = [];
        super.destroy();
    }
    waitForNotLoading(callback: () => void, groupName: string) {
        this._waitQueue.enQueue({
            prop: PROP_NAME.isLoading,
            groupName: groupName,
            predicate: function (val: any) {
                return !val;
            },
            action: callback,
            actionArgs: [],
            lastWins: !!groupName
        });
    }
    toString() {
        return "Collection";
    }
    get options() { return this._options; }
    get items() { return this._items; }
    get currentItem() { return this.getItemByPos(this._currentPos); }
    set currentItem(v: TItem) { this._setCurrentItem(v); }
    get count() { return this._items.length; }
    get totalCount() { return this._totalCount; }
    set totalCount(v: number) {
        if (v !== this._totalCount) {
            this._totalCount = v;
            this.raisePropertyChanged(PROP_NAME.totalCount);
            this.raisePropertyChanged(PROP_NAME.pageCount);
        }
    }
    get pageSize() { return this._options.pageSize; }
    set pageSize(v: number) {
        if (this._options.pageSize !== v) {
            this._options.pageSize = v;
            this.raisePropertyChanged(PROP_NAME.pageSize);
            this._onPageSizeChanged();
        }
    }
    get pageIndex() { return this._pageIndex; }
    set pageIndex(v: number) {
        if (v !== this._pageIndex && this.isPagingEnabled) {
            if (v < 0)
                return;
            if (!this._onPageChanging()) {
                return;
            }
            this._pageIndex = v;
            this._onPageChanged();
            this.raisePropertyChanged(PROP_NAME.pageIndex);
        }
    }
    get pageCount() {
        let rowCount = this.totalCount, rowPerPage = this.pageSize, result: number;

        if ((rowCount === 0) || (rowPerPage === 0)) {
            return 0;
        }

        if ((rowCount % rowPerPage) === 0) {
            result = (rowCount / rowPerPage);
        }
        else {
            result = (rowCount / rowPerPage);
            result = Math.floor(result) + 1;
        }
        return result;
    }
    get isPagingEnabled() { return this._options.enablePaging; }
    get isEditing() { return !!this._EditingItem; }
    get isLoading() { return this._isLoading; }
    get isUpdating() { return this._isUpdating; }
    set isUpdating(v: boolean) {
        if (this._isUpdating !== v) {
            this._isUpdating = v;
            this.raisePropertyChanged(PROP_NAME.isUpdating);
        }
    }
    get permissions(): IPermissions { return this._perms; }
}