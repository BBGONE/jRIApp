/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    SORT_ORDER, COLL_CHANGE_TYPE, COLL_CHANGE_REASON, COLL_CHANGE_OPER
} from "jriapp_shared/collection/const";
import {
    IPromise, TEventHandler, TPriority, LocaleERRS as ERRS, Debounce, Utils
} from "jriapp_shared";
import {
    ICollection, ICollectionItem, ICollChangedArgs, ICollItemStatusArgs, IFieldInfo, IPermissions
} from "jriapp_shared/collection/int";
import { BaseCollection, Errors } from "jriapp_shared/collection/base";
import { PROP_NAME } from "./const";

const utils = Utils, _async = utils.defer, checks = utils.check,
    strUtils = utils.str, coreUtils = utils.core,
    arrHelper = utils.arr, ERROR = utils.err, sys = utils.sys;

const VIEW_EVENTS = {
    refreshed: "view_refreshed"
};

export interface IDataViewOptions<TItem extends ICollectionItem> {
    dataSource: ICollection<TItem>;
    fn_filter?: (item: TItem) => boolean;
    fn_sort?: (item1: TItem, item2: TItem) => number;
    fn_itemsProvider?: (ds: ICollection<TItem>) => TItem[];
}

export class DataView<TItem extends ICollectionItem> extends BaseCollection<TItem> {
    private _dataSource: ICollection<TItem>;
    private _fn_filter: (item: TItem) => boolean;
    private _fn_sort: (item1: TItem, item2: TItem) => number;
    private _fn_itemsProvider: (ds: ICollection<TItem>) => TItem[];
    private _isAddingNew: boolean;
    private _refreshDebounce: Debounce;

    constructor(options: IDataViewOptions<TItem>) {
        super();
        const opts = coreUtils.extend({
            dataSource: null,
            fn_filter: null,
            fn_sort: null,
            fn_itemsProvider: null
        }, options);

        if (!sys.isCollection(opts.dataSource))
            throw new Error(ERRS.ERR_DATAVIEW_DATASRC_INVALID);
        if (!!opts.fn_filter && !checks.isFunc(opts.fn_filter))
            throw new Error(ERRS.ERR_DATAVIEW_FILTER_INVALID);
        this._refreshDebounce = new Debounce();
        this._dataSource = opts.dataSource;
        this._fn_filter = !opts.fn_filter ? null : opts.fn_filter;
        this._fn_sort = opts.fn_sort;
        this._fn_itemsProvider = opts.fn_itemsProvider;
        this._isAddingNew = false;
        const self = this, ds = this._dataSource;
        ds.getFieldNames().forEach((name) => {
            self._fieldMap[name] = ds.getFieldInfo(name);
        });
        this._bindDS();
    }
    protected _getEventNames() {
        const base_events = super._getEventNames();
        return [VIEW_EVENTS.refreshed].concat(base_events);
    }
    // override
    protected _clearItems(items: TItem[]) {
        // noop
    }
    addOnViewRefreshed(fn: TEventHandler<DataView<TItem>, any>, nmspace?: string) {
        this._addHandler(VIEW_EVENTS.refreshed, fn, nmspace);
    }
    removeOnViewRefreshed(nmspace?: string) {
        this._removeHandler(VIEW_EVENTS.refreshed, nmspace);
    }
    protected _filterForPaging(items: TItem[]) {
        let skip = 0, take = 0, pos = -1, cnt = -1;
        const result: TItem[] = [];
        skip = this.pageSize * this.pageIndex;
        take = this.pageSize;
        items.forEach((item) => {
            cnt += 1;
            if (cnt < skip) {
                return;
            }
            pos += 1;
            if (pos < take) {
                result.push(item);
            }
        });
        return result;
    }
    protected _onViewRefreshed(args: {}) {
        this.raiseEvent(VIEW_EVENTS.refreshed, args);
    }
    protected _refresh(reason: COLL_CHANGE_REASON): void {
        if (this.getIsDestroyCalled())
            return;
        try {
            let items: TItem[];
            const ds = this._dataSource;
            if (!ds || ds.getIsDestroyCalled()) {
                this.clear();
                this._onViewRefreshed({});
                return;
            }

            if (!!this._fn_itemsProvider) {
                items = this._fn_itemsProvider(ds);
            }
            else {
                items = ds.items;
            }

            if (!!this._fn_filter) {
                items = items.filter(this._fn_filter);
            }
            if (!!this._fn_sort) {
                items = items.sort(this._fn_sort);
            }
            this._fillItems({ items: items, reason: reason, clear: true, isAppend: false });
            this._onViewRefreshed({});
        }
        catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    protected _fillItems(data: {
        items: TItem[];
        reason: COLL_CHANGE_REASON;
        clear: boolean;
        isAppend: boolean;
    }): TItem[] {
        data = coreUtils.extend({
            items: [],
            reason: COLL_CHANGE_REASON.None,
            clear: true,
            isAppend: false
        }, data);

        const self = this, newItems: TItem[] = [], positions: number[] = [], items: TItem[] = [], isClearAll = !!data.clear;

        if (!!isClearAll) {
            this._clear(data.reason, COLL_CHANGE_OPER.Fill);
        }

        const arr = (this.isPagingEnabled && !data.isAppend) ? this._filterForPaging(data.items) : data.items;
        
        arr.forEach((item) => {
            const oldItem = self._itemsByKey[item._key];
            if (!oldItem) {
                self._itemsByKey[item._key] = item;
                newItems.push(item);
                positions.push(self._items.length - 1);
                self._items.push(item);
                items.push(item);
            }
            else {
                items.push(oldItem);
            }
        });

        if (newItems.length > 0) {
            this._onCountChanged();
        }

        if (isClearAll) {
            this.totalCount = data.items.length;
        }
        else {
            this.totalCount = this.totalCount + newItems.length;
        }

        this._onCollectionChanged({
            changeType: COLL_CHANGE_TYPE.Reset,
            reason: data.reason,
            oper: COLL_CHANGE_OPER.Fill,
            items: newItems,
            pos: positions
        });
        this._onFillEnd({
            items: items,
            newItems: newItems,
            reason: data.reason
        });

        if (isClearAll) {
            this.moveFirst();
        }

        return newItems;
    }
    protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<TItem>) {
        const self = this;
        switch (args.changeType) {
            case COLL_CHANGE_TYPE.Reset:
                this._refresh(COLL_CHANGE_REASON.None);
                break;
            case COLL_CHANGE_TYPE.Add:
                {
                    if (!this._isAddingNew) {
                        const items: TItem[] = (!self._fn_filter) ? args.items : args.items.filter(self._fn_filter);
                        if (items.length > 0) {
                            self.appendItems(items);
                        }
                    }
                }
                break;
            case COLL_CHANGE_TYPE.Remove:
                {
                    args.items.forEach((item) => {
                        const key = item._key;
                        item = self._itemsByKey[key];
                        if (!!item) {
                            self.removeItem(item);
                        }
                    });
                }
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    const item = self._itemsByKey[args.old_key];
                    if (!!item) {
                        delete self._itemsByKey[args.old_key];
                        self._itemsByKey[args.new_key] = item;
                        this._onCollectionChanged(args);
                    }
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
        }
    }
    protected _onDSStatusChanged(sender: any, args: ICollItemStatusArgs<TItem>) {
        const self = this, item = args.item, key = args.key, oldStatus = args.oldStatus, canFilter = !!self._fn_filter;

        if (!!self._itemsByKey[key]) {
            self._onItemStatusChanged(item, oldStatus);
            if (canFilter) {
                const isOk = self._fn_filter(item);
                if (!isOk) {
                    self.removeItem(item);
                }
            }
        }
        else {
            if (canFilter) {
                const isOk = self._fn_filter(item);
                if (isOk) {
                    self.appendItems([item]);
                }
            }
        }
    }
    protected _bindDS() {
        const self = this, ds = this._dataSource;
        if (!ds)
            return;
        ds.addOnCollChanged(self._onDSCollectionChanged, self.uniqueID, self, TPriority.AboveNormal);
        ds.addOnBeginEdit((sender, args) => {
            if (!!self._itemsByKey[args.item._key]) {
                self._onEditing(args.item, true, false);
            }
        }, self.uniqueID, null, TPriority.AboveNormal);
        ds.addOnEndEdit((sender, args) => {
            let isOk: boolean;
            const item = args.item, canFilter = !!self._fn_filter;
            if (!!self._itemsByKey[item._key]) {
                self._onEditing(item, false, args.isCanceled);
                if (!args.isCanceled && canFilter) {
                    isOk = self._fn_filter(item);
                    if (!isOk)
                        self.removeItem(item);
                }
            }
            else {
                if (!args.isCanceled && canFilter) {
                    isOk = self._fn_filter(item);
                    if (isOk) {
                        self.appendItems([item]);
                    }
                }
            }
        }, self.uniqueID, null, TPriority.AboveNormal);
        ds.addOnErrorsChanged((sender, args) => {
            if (!!self._itemsByKey[args.item._key]) {
                self._getInternal().onErrorsChanged(args);
            }
        }, self.uniqueID, null, TPriority.AboveNormal);
        ds.addOnStatusChanged(self._onDSStatusChanged, self.uniqueID, self, TPriority.AboveNormal);

        ds.addOnItemDeleting((sender, args) => {
            if (!!self._itemsByKey[args.item._key]) {
                self._onItemDeleting(args);
            }
        }, self.uniqueID, null, TPriority.AboveNormal);
        ds.addOnItemAdded((sender, args) => {
            if (self._isAddingNew) {
                if (!self._itemsByKey[args.item._key]) {
                    self._attach(args.item);
                }
                self.currentItem = args.item;
                self._onEditing(args.item, true, false);
                self._onItemAdded(args.item);
            }
        }, self.uniqueID, null, TPriority.AboveNormal);
        ds.addOnItemAdding((sender, args) => {
            if (self._isAddingNew) {
                self._onItemAdding(args.item);
            }
        }, self.uniqueID, null, TPriority.AboveNormal);
    }
    protected _unbindDS() {
        const self = this, ds = this._dataSource;
        if (!ds) return;
        ds.removeNSHandlers(self.uniqueID);
    }
    protected _checkCurrentChanging(newCurrent: TItem) {
        const ds = this._dataSource;
        try {
            const item = (<BaseCollection<TItem>>ds)._getInternal().getEditingItem();
            if (!!item && newCurrent !== item)
                ds.endEdit();
        }
        catch (ex) {
            ds.cancelEdit();
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    protected _onPageChanged() {
        this._refresh(COLL_CHANGE_REASON.PageChange);
    }
    protected _clear(reason: COLL_CHANGE_REASON, oper: COLL_CHANGE_OPER) {
        super._clear(reason, oper);
        if (reason !== COLL_CHANGE_REASON.PageChange)
            this.pageIndex = 0;
    }
    _getStrValue(val: any, fieldInfo: IFieldInfo): string {
        return (<BaseCollection<TItem>>this._dataSource)._getInternal().getStrValue(val, fieldInfo);
    }
    appendItems(items: TItem[]) {
        if (this._isDestroyCalled)
            return [];
        return this._fillItems({ items: items, reason: COLL_CHANGE_REASON.None, clear: false, isAppend: true });
    }
    addNew() {
        let item: TItem = null;
        this._isAddingNew = true;
        try {
            item = this._dataSource.addNew();
        } finally {
            this._isAddingNew = false;
        }
        return item;
    }
    removeItem(item: TItem) {
        if (!this._itemsByKey[item._key])
            return;
        const oldPos = arrHelper.remove(this._items, item);
        if (oldPos < 0) {
            throw new Error(ERRS.ERR_ITEM_IS_NOTFOUND);
        }
        delete this._itemsByKey[item._key];
        this.errors.removeAllErrors(item);
        this.totalCount = this.totalCount - 1;
        this._onRemoved(item, oldPos);
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
    }
    sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any> {
        return _async.delay(() => { this.fn_sort = this._getSortFn(fieldNames, sortOrder); });
    }
    clear() {
        this._clear(COLL_CHANGE_REASON.None, COLL_CHANGE_OPER.None);
        this.totalCount = 0;
    }
    refresh(): void {
        this._refreshDebounce.enque(() => {
            this._refresh(COLL_CHANGE_REASON.None);
        });
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._refreshDebounce.destroy();
        this._refreshDebounce = null;
        this._unbindDS();
        this._dataSource = null;
        this._fn_filter = null;
        this._fn_sort = null;
        super.destroy();
    }
    get errors(): Errors<TItem> {
        return (<BaseCollection<TItem>>this._dataSource).errors;
    }
    get dataSource(): ICollection<TItem> { return this._dataSource; }
    get isPagingEnabled(): boolean { return this._options.enablePaging; }
    set isPagingEnabled(v) {
        if (this._options.enablePaging !== v) {
            this._options.enablePaging = v;
            this.raisePropertyChanged(PROP_NAME.isPagingEnabled);
            this._refresh(COLL_CHANGE_REASON.None);
        }
    }
    get permissions(): IPermissions { return this._dataSource.permissions; }
    get fn_filter() { return this._fn_filter; }
    set fn_filter(v: (item: TItem) => boolean) {
        if (this._fn_filter !== v) {
            this._fn_filter = v;
            this._refresh(COLL_CHANGE_REASON.None);
        }
    }
    get fn_sort() { return this._fn_sort; }
    set fn_sort(v: (item1: TItem, item2: TItem) => number) {
        if (this._fn_sort !== v) {
            this._fn_sort = v;
            this._refresh(COLL_CHANGE_REASON.Sorting);
        }
    }
    get fn_itemsProvider() { return this._fn_itemsProvider; }
    set fn_itemsProvider(v: (ds: BaseCollection<TItem>) => TItem[]) {
        if (this._fn_itemsProvider !== v) {
            this._fn_itemsProvider = v;
            this._refresh(COLL_CHANGE_REASON.None);
        }
    }
}

export type TDataView = DataView<ICollectionItem>;