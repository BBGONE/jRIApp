/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    DATE_CONVERSION, DATA_TYPE, FIELD_TYPE, SORT_ORDER,
    ITEM_STATUS, COLL_CHANGE_REASON, COLL_CHANGE_TYPE, COLL_CHANGE_OPER
} from "./const";
import { IFieldInfo } from "./int";
import { IPromise } from "../utils/ideferred";
import {
    IIndexer, IValidationInfo, TEventHandler, TPropChangedHandler,
    IBaseObject, TPriority
} from "../int";
import { BaseObject }  from "../object";
import { ERRS } from "../lang";
import { WaitQueue } from "../utils/waitqueue";
import { Utils } from "../utils/utils";

import { ICollectionItem, ICollection, ICollectionOptions, IPermissions, IInternalCollMethods, ICollChangedArgs,
    ICancellableArgs, ICollFillArgs, ICollEndEditArgs, ICollItemArgs, ICollItemStatusArgs,
    ICollValidateFieldArgs, ICollValidateItemArgs, ICurrentChangingArgs, ICommitChangesArgs, IItemAddedArgs, IPageChangingArgs,
    IErrorsList, IErrors, PROP_NAME
} from "./int";
import { ValueUtils, CollUtils } from "./utils";
import { ValidationError } from "../errors";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, sys = utils.sys,
    valUtils = ValueUtils, collUtils = CollUtils;


// REPLACE DUMMY IMPLEMENTATIONS
sys.isCollection = (obj) => { return (!!obj && obj instanceof BaseCollection); };

const enum COLL_EVENTS {
    begin_edit = "beg_edit",
    end_edit = "end_edit",
    before_begin_edit = "before_be",
    before_end_edit = "before_ee",
    collection_changed = "coll_changed",
    fill = "fill",
    item_deleting = "item_deleting",
    item_adding = "item_adding",
    item_added = "item_added",
    validate_field = "validate_field",
    validate_item = "validate_item",
    current_changing = "current_changing",
    page_changing = "page_changing",
    errors_changed = "errors_changed",
    status_changed = "status_changed",
    clearing = "clearing",
    cleared = "cleared",
    commit_changes = "commit_changes"
}

export class Errors<TItem extends ICollectionItem> {
    private _errors: IErrorsList;
    private _owner: BaseCollection<TItem>;

    constructor(owner: BaseCollection<TItem>) {
        this._errors = {};
        this._owner = owner;
    }
    clear(): void {
        this._errors = {};
    }
    validateItem(item: TItem): IValidationInfo[] {
        const args: ICollValidateItemArgs<TItem> = { item: item, result: [] };
        return this._owner._getInternal().validateItem(args);
    }
    validateItemField(item: TItem, fieldName: string): IValidationInfo {
        const args: ICollValidateFieldArgs<TItem> = { item: item, fieldName: fieldName, errors: <string[]>[] };
        return this._owner._getInternal().validateItemField(args);
    }
    addErrors(item: TItem, errors: IValidationInfo[]): void {
        errors.forEach((err) => {
            this.addError(item, err.fieldName, err.errors, true);
        });
        this.onErrorsChanged(item);
    }
    addError(item: TItem, fieldName: string, errors: string[], ignoreChangeErrors?: boolean): void {
        if (!fieldName) {
            fieldName = "*";
        }
        if (!(checks.isArray(errors) && errors.length > 0)) {
            this.removeError(item, fieldName, ignoreChangeErrors);
            return;
        }
        if (!this._errors[item._key]) {
            this._errors[item._key] = {};
        }
        const itemErrors = this._errors[item._key];
        itemErrors[fieldName] = errors;
        if (!ignoreChangeErrors) {
            this.onErrorsChanged(item);
        }
    }
    removeError(item: TItem, fieldName: string, ignoreChangeErrors?: boolean): void {
        const itemErrors = this._errors[item._key];
        if (!itemErrors) {
            return;
        }
        if (!fieldName) {
            fieldName = "*";
        }
        if (!itemErrors[fieldName]) {
            return;
        }
        delete itemErrors[fieldName];
        if (Object.keys(itemErrors).length === 0) {
            delete this._errors[item._key];
        }
        if (!ignoreChangeErrors) {
            this.onErrorsChanged(item);
        }
    }
    removeAllErrors(item: TItem): void {
        const itemErrors = this._errors[item._key];
        if (!itemErrors) {
            return;
        }
        delete this._errors[item._key];
        this.onErrorsChanged(item);
    }
    getErrors(item: TItem): IErrors {
        return this._errors[item._key];
    }
    onErrorsChanged(item: TItem): void {
        const args: ICollItemArgs<TItem> = { item: item };
        this._owner._getInternal().onErrorsChanged(args);
        item._aspect.raiseErrorsChanged();
    }
    getItemsWithErrors(): TItem[] {
        const res: TItem[] = [];
        coreUtils.forEachProp(this._errors, (key) => {
            const item = this._owner.getItemByKey(key);
            res.push(item);
        });
        return res;
    }
}

export abstract class BaseCollection<TItem extends ICollectionItem> extends BaseObject implements ICollection<TItem> {
    private _objId: string;
    private _perms: IPermissions;
    private _options: ICollectionOptions;
    protected _isLoading: boolean;
    protected _EditingItem: TItem;
    protected _totalCount: number;
    protected _pageIndex: number;
    protected _items: TItem[];
    protected _itemsByKey: IIndexer<TItem>;
    protected _currentPos: number;
    protected _newKey: number;
    protected _fieldMap: IIndexer<IFieldInfo>;
    protected _fieldInfos: IFieldInfo[];
    protected _errors: Errors<TItem>;
    protected _pkInfo: IFieldInfo[];
    protected _isUpdating: boolean;
    protected _waitQueue: WaitQueue;
    protected _internal: IInternalCollMethods<TItem>;

    constructor() {
        super();
        const self = this;
        this._objId = coreUtils.getNewID("coll");
        this._options = { enablePaging: false, pageSize: 50 };
        this._isLoading = false;
        this._isUpdating = false;

        this._EditingItem = null;
        this._perms = { canAddRow: true, canEditRow: true, canDeleteRow: true, canRefreshRow: false };
        // includes stored on server
        this._totalCount = 0;
        this._pageIndex = 0;
        this._items = [];
        this._itemsByKey = {};
        this._currentPos = -1;
        this._newKey = 0;
        this._fieldMap = {};
        this._fieldInfos = [];
        this._errors = new Errors(this);
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
            onItemDeleting: (args: ICancellableArgs<TItem>) => {
                return self._onItemDeleting(args);
            },
            onErrorsChanged: (args: ICollItemArgs<TItem>) => {
                self.objEvents.raise(COLL_EVENTS.errors_changed, args);
            },
            validateItemField: (args: ICollValidateFieldArgs<TItem>) => {
                self.objEvents.raise(COLL_EVENTS.validate_field, args);
                return (!!args.errors && args.errors.length > 0) ? <IValidationInfo>{ fieldName: args.fieldName, errors: args.errors } : <IValidationInfo>null;
            },
            validateItem: (args: ICollValidateItemArgs<TItem>) => {
                self.objEvents.raise(COLL_EVENTS.validate_item, args);
                return (!!args.result && args.result.length > 0) ? args.result : <IValidationInfo[]>[];
            }
        };
    }
    static getEmptyFieldInfo(fieldName: string) {
        const fieldInfo: IFieldInfo = {
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
    addOnClearing(fn: TEventHandler<ICollection<TItem>, { reason: COLL_CHANGE_REASON; }>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.clearing, fn, nmspace, context, priority);
    }
    offOnClearing(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.clearing, nmspace);
    }
    addOnCleared(fn: TEventHandler<ICollection<TItem>, { reason: COLL_CHANGE_REASON; }>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.cleared, fn, nmspace, context, priority);
    }
    offOnCleared(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.cleared, nmspace);
    }
    addOnCollChanged(fn: TEventHandler<ICollection<TItem>, ICollChangedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.collection_changed, fn, nmspace, context, priority);
    }
    offOnCollChanged(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.collection_changed, nmspace);
    }
    addOnFill(fn: TEventHandler<ICollection<TItem>, ICollFillArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.fill, fn, nmspace, context, priority);
    }
    offOnFill(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.fill, nmspace);
    }
    addOnValidateField(fn: TEventHandler<ICollection<TItem>, ICollValidateFieldArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.validate_field, fn, nmspace, context, priority);
    }
    offOnValidateField(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.validate_field, nmspace);
    }
    addOnValidateItem(fn: TEventHandler<ICollection<TItem>, ICollValidateItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.validate_item, fn, nmspace, context, priority);
    }
    offOnValidateItem(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.validate_item, nmspace);
    }
    addOnItemDeleting(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.item_deleting, fn, nmspace, context, priority);
    }
    offOnItemDeleting(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.item_deleting, nmspace);
    }
    addOnItemAdding(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.item_adding, fn, nmspace, context, priority);
    }
    offOnItemAdding(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.item_adding, nmspace);
    }
    addOnItemAdded(fn: TEventHandler<ICollection<TItem>, IItemAddedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.item_added, fn, nmspace, context, priority);
    }
    offOnItemAdded(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.item_added, nmspace);
    }
    addOnCurrentChanging(fn: TEventHandler<ICollection<TItem>, ICurrentChangingArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.current_changing, fn, nmspace, context, priority);
    }
    offOnCurrentChanging(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.current_changing, nmspace);
    }
    addOnPageChanging(fn: TEventHandler<ICollection<TItem>, IPageChangingArgs>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.page_changing, fn, nmspace, context, priority);
    }
    offOnPageChanging(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.page_changing, nmspace);
    }
    addOnErrorsChanged(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.errors_changed, fn, nmspace, context, priority);
    }
    offOnErrorsChanged(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.errors_changed, nmspace);
    }
    addOnBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.begin_edit, fn, nmspace, context, priority);
    }
    offOnBeginEdit(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.begin_edit, nmspace);
    }
    addOnEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.end_edit, fn, nmspace, context, priority);
    }
    offOnEndEdit(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.end_edit, nmspace);
    }
    addOnBeforeBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.before_begin_edit, fn, nmspace, context, priority);
    }
    offOnBeforeBeginEdit(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.before_begin_edit, nmspace);
    }
    addOnBeforeEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.before_end_edit, fn, nmspace, context, priority);
    }
    removeBeforeOnEndEdit(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.before_end_edit, nmspace);
    }
    addOnCommitChanges(fn: TEventHandler<ICollection<TItem>, ICommitChangesArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.commit_changes, fn, nmspace, context, priority);
    }
    offOnCommitChanges(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.commit_changes, nmspace);
    }
    addOnStatusChanged(fn: TEventHandler<ICollection<TItem>, ICollItemStatusArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this.objEvents.on(COLL_EVENTS.status_changed, fn, nmspace, context, priority);
    }
    offOnStatusChanged(nmspace?: string) {
        this.objEvents.off(COLL_EVENTS.status_changed, nmspace);
    }
    addOnPageIndexChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        this.objEvents.onProp(PROP_NAME.pageIndex, handler, nmspace, context);
    }
    addOnPageSizeChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        this.objEvents.onProp(PROP_NAME.pageSize, handler, nmspace, context);
    }
    addOnTotalCountChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        this.objEvents.onProp(PROP_NAME.totalCount, handler, nmspace, context);
    }
    addOnCurrentChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void {
        this.objEvents.onProp(PROP_NAME.currentItem, handler, nmspace, context);
    }
    protected _updatePermissions(perms: IPermissions): void {
        this._perms = perms;
    }
    protected _getPKFieldInfos(): IFieldInfo[] {
        if (!!this._pkInfo) {
            return this._pkInfo;
        }
        const fldMap = this._fieldMap, pk: IFieldInfo[] = [];
        coreUtils.forEachProp(fldMap, (fldName) => {
            if (fldMap[fldName].isPrimaryKey > 0) {
                pk.push(fldMap[fldName]);
            }
        });
        pk.sort((a, b) => {
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
        this.objEvents.raise(COLL_EVENTS.current_changing, <ICurrentChangingArgs<TItem>>{ newCurrent: newCurrent });
    }
    protected _onCurrentChanged() {
        this.objEvents.raiseProp(PROP_NAME.currentItem);
    }
    protected _onCountChanged() {
        this.objEvents.raiseProp(PROP_NAME.count);
    }
    protected _onEditingChanged() {
        this.objEvents.raiseProp(PROP_NAME.isEditing);
    }
    // occurs when item status Changed (not used in simple collections)
    protected _onItemStatusChanged(item: TItem, oldStatus: ITEM_STATUS) {
        this.objEvents.raise(COLL_EVENTS.status_changed, <ICollItemStatusArgs<TItem>>{ item: item, oldStatus: oldStatus, key: item._key });
    }
    protected _onCollectionChanged(args: ICollChangedArgs<TItem>) {
        this.objEvents.raise(COLL_EVENTS.collection_changed, args);
    }
    protected _onFillEnd(args: ICollFillArgs<TItem>) {
        this.objEvents.raise(COLL_EVENTS.fill, args);
    }
    // new item is being added, but is not in the collection now
    protected _onItemAdding(item: TItem) {
        const args: ICancellableArgs<TItem> = { item: item, isCancel: false };
        this.objEvents.raise(COLL_EVENTS.item_adding, args);
        if (args.isCancel) {
            utils.err.throwDummy(new Error("operation canceled"));
        }
    }
    // new item has been added and now is in editing state and is currentItem
    protected _onItemAdded(item: TItem) {
        const args: IItemAddedArgs<TItem> = { item: item, isAddNewHandled: false };
        this.objEvents.raise(COLL_EVENTS.item_added, args);
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
        } else {
            pos = itemPos;
            utils.arr.insert(this._items, item, pos);
        }
        this._itemsByKey[item._key] = item;
        this._onCollectionChanged({
            changeType: COLL_CHANGE_TYPE.Add,
            reason: COLL_CHANGE_REASON.None,
            oper: COLL_CHANGE_OPER.Attach,
            items: [item],
            pos: [pos],
            new_key: item._key
        });
        item._aspect._onAttach();
        this.objEvents.raiseProp(PROP_NAME.count);
        this._onCurrentChanging(item);
        this._currentPos = pos;
        this._onCurrentChanged();
        return pos;
    }
    protected _onRemoved(item: TItem, pos: number) {
        try {
            this._onCollectionChanged({
                changeType: COLL_CHANGE_TYPE.Remove,
                reason: COLL_CHANGE_REASON.None,
                oper: COLL_CHANGE_OPER.Remove,
                items: [item],
                pos: [pos],
                old_key: item._key
            });
        } finally {
            this.objEvents.raiseProp(PROP_NAME.count);
        }
    }
    protected _onPageSizeChanged() {
    }
    protected _onPageChanging() {
        const args: IPageChangingArgs = { page: this.pageIndex, isCancel: false };
        this.objEvents.raise(COLL_EVENTS.page_changing, args);
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
        const self = this, oldPos = self._currentPos;
        if (!v) {
            if (oldPos !== -1) {
                self._onCurrentChanging(null);
                self._currentPos = -1;
                self._onCurrentChanged();
            }
            return;
        }
        if (v._aspect.isDetached) {
            throw new Error(ERRS.ERR_ITEM_IS_DETACHED);
        }
        const item = self.getItemByKey(v._key);
        if (!item) {
            throw new Error(ERRS.ERR_ITEM_IS_NOTFOUND);
        }
        const oldItem = self.getItemByPos(oldPos);
        const pos = self._items.indexOf(v);
        if (pos < 0) {
            throw new Error(ERRS.ERR_ITEM_IS_NOTFOUND);
        }
        if (oldPos !== pos || oldItem !== v) {
            self._onCurrentChanging(v);
            self._currentPos = pos;
            self._onCurrentChanged();
        }
    }
    // it is overriden in DataView class!!!
    protected _clearItems(items: TItem[]) {
        items.forEach((item) => {
            item._aspect._setIsAttached(false);
            item.dispose();
        });
    }
    // override
    isHasProp(prop: string) {
        // first check for indexed property name
        if (strUtils.startsWith(prop, "[")) {
            const res = sys.getProp(this, prop);
            return !checks.isUndefined(res);
        }
        return super.isHasProp(prop);
    }
    protected _getEditingItem() {
        return this._EditingItem;
    }
    protected _getStrValue(val: any, fieldInfo: IFieldInfo): string {
        const dcnv = fieldInfo.dateConversion, stz = coreUtils.getTimeZoneOffset();
        return valUtils.stringifyValue(val, dcnv, fieldInfo.dataType, stz);
    }
    protected _onBeforeEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void {
        if (this._isUpdating) {
            return;
        }
        if (isBegin) {
            this.objEvents.raise(COLL_EVENTS.before_begin_edit, <ICollItemArgs<TItem>>{ item: item });
        } else {
            this.objEvents.raise(COLL_EVENTS.before_end_edit, { item: item, isCanceled: isCanceled });
        }
    }
    protected _onEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void {
        if (this._isUpdating) {
            return;
        }
        if (isBegin) {
            this._EditingItem = item;
            this.objEvents.raise(COLL_EVENTS.begin_edit, <ICollItemArgs<TItem>>{ item: item });
            this._onEditingChanged();
            if (!!item) {
                item._aspect.objEvents.raiseProp(PROP_NAME.isEditing);
            }
        } else {
            const oldItem = this._EditingItem;
            this._EditingItem = null;
            this.objEvents.raise(COLL_EVENTS.end_edit, { item: item, isCanceled: isCanceled });
            this._onEditingChanged();
            if (!!oldItem) {
                oldItem._aspect.objEvents.raiseProp(PROP_NAME.isEditing);
            }
        }
    }
    // used by descendants when commiting submits for items
    protected _onCommitChanges(item: TItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void {
        this.objEvents.raise(COLL_EVENTS.commit_changes, <ICommitChangesArgs<TItem>>{ item: item, isBegin: isBegin, isRejected: isRejected, status: status });
    }
    protected _validateItem(item: TItem): IValidationInfo[] {
        const args: ICollValidateItemArgs<TItem> = { item: item, result: [] };
        this.objEvents.raise(COLL_EVENTS.validate_item, args);
        return (!!args.result && args.result.length > 0) ? args.result : [];
    }
    protected _validateItemField(item: TItem, fieldName: string): IValidationInfo {
        const args: ICollValidateFieldArgs<TItem> = { item: item, fieldName: fieldName, errors: <string[]>[] };
        this.objEvents.raise(COLL_EVENTS.validate_field, args);
        return (!!args.errors && args.errors.length > 0) ? { fieldName: fieldName, errors: args.errors } : null;
    }
    protected _onItemDeleting(args: ICancellableArgs<TItem>): boolean {
        this.objEvents.raise(COLL_EVENTS.item_deleting, args);
        return !args.isCancel;
    }
    protected _clear(reason: COLL_CHANGE_REASON, oper: COLL_CHANGE_OPER) {
        this.objEvents.raise(COLL_EVENTS.clearing, { reason: reason });
        this.cancelEdit();
        this._EditingItem = null;
        this._newKey = 0;
        this.currentItem = null;
        const oldItems = this._items;
        try {
            this._items = [];
            this._itemsByKey = {};
            this._errors.clear();
            if (oper !== COLL_CHANGE_OPER.Fill) {
                this._onCollectionChanged({
                    changeType: COLL_CHANGE_TYPE.Reset,
                    reason: reason,
                    oper: oper,
                    items: [],
                    pos: []
                });
            }
            this.objEvents.raise(COLL_EVENTS.cleared, { reason: reason });
            this._onCountChanged();
        } finally {
            this._clearItems(oldItems);
        }
    }
    _setIsLoading(v: boolean) {
        if (this._isLoading !== v) {
            this._isLoading = v;
            this.objEvents.raiseProp(PROP_NAME.isLoading);
        }
    }
    _getInternal(): IInternalCollMethods<TItem> {
        return this._internal;
    }
    _getSortFn(fieldNames: string[], sortOrder: SORT_ORDER): (a: any, b: any) => number {
        let mult = 1;
        if (sortOrder === SORT_ORDER.DESC) {
            mult = -1;
        }
        return (a: any, b: any) => {
            let res = 0, i: number, af: any, bf: any, fieldName: string;
            const len = fieldNames.length;
            for (i = 0; i < len; i += 1) {
                fieldName = fieldNames[i];
                af = sys.resolvePath(a, fieldName);
                bf = sys.resolvePath(b, fieldName);
                if (af === checks.undefined) {
                    af = null;
                }
                if (bf === checks.undefined) {
                    bf = null;
                }

                if (af === null && bf !== null) {
                    res = -1 * mult;
                } else if (af !== null && bf === null) {
                    res = mult;
                } else if (af < bf) {
                    res = -1 * mult;
                } else if (af > bf) {
                    res = mult;
                } else {
                    res = 0;
                }

                if (res !== 0) {
                    return res;
                }
            }
            return res;
        };
    }
    getFieldInfo(fieldName: string): IFieldInfo {
        const parts = fieldName.split(".");
        let fld = this._fieldMap[parts[0]];
        if (parts.length === 1) {
            return fld;
        }

        if (fld.fieldType === FIELD_TYPE.Object) {
            for (let i = 1; i < parts.length; i += 1) {
                fld = collUtils.getObjectField(parts[i], fld.nested);
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
        return this._errors.getItemsWithErrors();
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
        } catch (ex) {
            isHandled = this.handleError(ex, this);
            item._aspect.cancelEdit();
            utils.err.reThrow(ex, isHandled);
        }
        return item;
    }
    getItemByPos(pos: number): TItem {
        if (pos < 0 || pos >= this._items.length) {
            return null;
        }
        return this._items[pos];
    }
    getItemByKey(key: string): TItem {
        if (!key) {
            throw new Error(ERRS.ERR_KEY_IS_EMPTY);
        }
        return this._itemsByKey["" + key];
    }
    findByPK(...vals: any[]): TItem {
        if (arguments.length === 0) {
            return null;
        }
        const self = this, pkInfo = self._getPKFieldInfos(), arr: string[] = [];
        let key: string, values: any[] = [];
        if (vals.length === 1 && checks.isArray(vals[0])) {
            values = vals[0];
        } else {
            values = vals;
        }
        if (values.length !== pkInfo.length) {
            return null;
        }
        const len = pkInfo.length;
        for (let i = 0; i < len; i += 1) {
            arr.push(self._getStrValue(values[i], pkInfo[i]));
        }

        key = arr.join(";");
        return self.getItemByKey(key);
    }
    moveFirst(skipDeleted?: boolean): boolean {
        const pos = 0, old = this._currentPos;
        if (old === pos) {
            return false;
        }
        const item = this.getItemByPos(pos);
        if (!item) {
            return false;
        }
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
        let pos = -1;
        const old = this._currentPos;
        let item = this.getItemByPos(old);
        if (!!item) {
            pos = old;
            pos -= 1;
        }
        item = this.getItemByPos(pos);
        if (!item) {
            return false;
        }
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
        let pos = -1;
        const old = this._currentPos;
        let item = this.getItemByPos(old);
        if (!!item) {
            pos = old;
            pos += 1;
        }
        item = this.getItemByPos(pos);
        if (!item) {
            return false;
        }
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
        const pos = this._items.length - 1, old = this._currentPos;
        if (old === pos) {
            return false;
        }
        const item = this.getItemByPos(pos);
        if (!item) {
            return false;
        }
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
        const old = this._currentPos;
        if (old === pos) {
            return false;
        }
        const item = this.getItemByPos(pos);
        if (!item) {
            return false;
        }
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
            this._errors.removeAllErrors(item);
            item._aspect._setIsAttached(false);

            const test = this.getItemByPos(oldPos), curPos = this._currentPos;

            // if detached item was current item
            if (curPos === oldPos) {
                if (!test) { // it was the last item
                    this._currentPos = curPos - 1;
                }
                this._onCurrentChanged();
            }

            if (curPos > oldPos) {
                this._currentPos = curPos - 1;
                this._onCurrentChanged();
            }
        } finally {
            if (!item.getIsStateDirty()) {
                item.dispose();
            }
        }
    }
    sort(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any> {
        return this.sortLocal(fieldNames, sortOrder);
    }
    sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any> {
        const sortFn = this._getSortFn(fieldNames, sortOrder);
        const self = this, deferred = utils.defer.createDeferred<void>();
        this.waitForNotLoading(() => {
            const cur = self.currentItem;
            self._setIsLoading(true);
            try {
                self._items.sort(sortFn);
                self._onCollectionChanged({
                    changeType: COLL_CHANGE_TYPE.Reset,
                    reason: COLL_CHANGE_REASON.Sorting,
                    oper: COLL_CHANGE_OPER.Sort,
                    items: [],
                    pos: []
                });
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
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._waitQueue.dispose();
        this._waitQueue = null;
        this.clear();
        this._fieldMap = {};
        this._fieldInfos = [];
        super.dispose();
    }
    waitForNotLoading(callback: () => void, groupName: string) {
        this._waitQueue.enQueue({
            prop: PROP_NAME.isLoading,
            groupName: groupName,
            predicate: (val: any) => !val,
            action: callback,
            actionArgs: [],
            lastWins: !!groupName
        });
    }
    toString() {
        return "Collection";
    }
    get errors() { return this._errors; }
    get options() { return this._options; }
    get items() { return this._items; }
    get currentItem() { return this.getItemByPos(this._currentPos); }
    set currentItem(v: TItem) { this._setCurrentItem(v); }
    get count() { return this._items.length; }
    get totalCount() { return this._totalCount; }
    set totalCount(v: number) {
        if (v !== this._totalCount) {
            this._totalCount = v;
            this.objEvents.raiseProp(PROP_NAME.totalCount);
            this.objEvents.raiseProp(PROP_NAME.pageCount);
        }
    }
    get pageSize() { return this._options.pageSize; }
    set pageSize(v: number) {
        if (this._options.pageSize !== v) {
            this._options.pageSize = v;
            this.objEvents.raiseProp(PROP_NAME.pageSize);
            this._onPageSizeChanged();
        }
    }
    get pageIndex() { return this._pageIndex; }
    set pageIndex(v: number) {
        if (v !== this._pageIndex && this.isPagingEnabled) {
            if (v < 0) {
                return;
            }
            if (!this._onPageChanging()) {
                return;
            }
            this._pageIndex = v;
            this._onPageChanged();
            this.objEvents.raiseProp(PROP_NAME.pageIndex);
        }
    }
    get pageCount() {
        const rowCount = this.totalCount, rowPerPage = this.pageSize;
        let result: number;

        if ((rowCount === 0) || (rowPerPage === 0)) {
            return 0;
        }

        if ((rowCount % rowPerPage) === 0) {
            result = (rowCount / rowPerPage);
        } else {
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
            this.objEvents.raiseProp(PROP_NAME.isUpdating);
        }
    }
    get permissions(): IPermissions { return this._perms; }
    get uniqueID() {
        return this._objId;
    }
}
