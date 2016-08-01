/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, DATE_CONVERSION, DATA_TYPE, SORT_ORDER } from "jriapp_core/const";
import { IPromise, IFieldInfo, TEventHandler } from "jriapp_core/shared";
import { ERRS } from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { parser } from "jriapp_core/parser";
import { Utils as utils, AsyncUtils as _async, Debounce, ERROR } from "jriapp_utils/utils";
import { ICollection, ICollectionItem, BaseCollection, COLL_CHANGE_REASON, COLL_CHANGE_OPER,
    ICollChangedArgs, COLL_CHANGE_TYPE, ICollItemStatusArgs, IErrors, IPermissions } from "jriapp_collection/collection";
import { PROP_NAME } from "const";

const checks = utils.check, strUtils = utils.str, coreUtils = utils.core, ArrayHelper = utils.arr;

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
    protected _fn_filter: (item: TItem) => boolean;
    private _fn_sort: (item1: TItem, item2: TItem) => number;
    private _fn_itemsProvider: (ds: ICollection<TItem>) => TItem[];
    private _isAddingNew: boolean;
    private _objId: string;
    protected _refreshDebounce: Debounce;

    constructor(options: IDataViewOptions<TItem>) {
        super();
        let opts = coreUtils.extend({
            dataSource: null,
            fn_filter: null,
            fn_sort: null,
            fn_itemsProvider: null
        }, options);

        if (!opts.dataSource || !(opts.dataSource instanceof BaseCollection))
            throw new Error(ERRS.ERR_DATAVIEW_DATASRC_INVALID);
        if (!opts.fn_filter || !checks.isFunc(opts.fn_filter))
            throw new Error(ERRS.ERR_DATAVIEW_FILTER_INVALID);
        this._refreshDebounce = new Debounce();
        this._objId = "dvw" + coreUtils.getNewID();
        this._dataSource = opts.dataSource;
        this._fn_filter = opts.fn_filter;
        this._fn_sort = opts.fn_sort;
        this._fn_itemsProvider = opts.fn_itemsProvider;
        this._isAddingNew = false;
        let self = this, ds = this._dataSource;
        ds.getFieldNames().forEach(function (name) {
            self._fieldMap[name] = ds.getFieldInfo(name);
        });
        this._bindDS();
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [VIEW_EVENTS.refreshed].concat(base_events);
    }
    protected _destroyItems() {
        //nothing
    }
    addOnViewRefreshed(fn: TEventHandler<DataView<TItem>, any>, nmspace?: string) {
        this._addHandler(VIEW_EVENTS.refreshed, fn, nmspace);
    }
    removeOnViewRefreshed(nmspace?: string) {
        this._removeHandler(VIEW_EVENTS.refreshed, nmspace);
    }
    protected _filterForPaging(items: TItem[]) {
        let skip = 0, take = 0, pos = -1, cnt = -1, result: TItem[] = [];
        skip = this.pageSize * this.pageIndex;
        take = this.pageSize;
        items.forEach(function (item) {
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
            let ds = this._dataSource;
            if (!ds || ds.getIsDestroyCalled()) {
                this.clear();
                this._onViewRefreshed({});
                return;
            }

            if (!!this._fn_itemsProvider) {
                items = this._fn_itemsProvider(ds);
            }
            else
                items = ds.items;

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

        let self = this, arr: TItem[], newItems: TItem[] = [], positions: number[] = [], items: TItem[] = [];
        let isClearAll = !!data.clear;

        if (!!isClearAll)
            this._clear(data.reason, COLL_CHANGE_OPER.Fill);

        if (this.isPagingEnabled && !data.isAppend) {
            arr = this._filterForPaging(data.items);
        }
        else
            arr = data.items;

        arr.forEach(function (item) {
            let oldItem = self._itemsByKey[item._key];
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

        if (isClearAll)
            this.totalCount = data.items.length;
        else
            this.totalCount = this.totalCount + newItems.length;

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

        if (isClearAll)
            this.moveFirst();

        return newItems;
    }
    protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<TItem>) {
        let self = this, item: ICollectionItem, items = args.items;
        switch (args.changeType) {
            case COLL_CHANGE_TYPE.Reset:
                this._refresh(COLL_CHANGE_REASON.None);
                break;
            case COLL_CHANGE_TYPE.Add:
                {
                    if (!this._isAddingNew) {
                        if (!!self._fn_filter) {
                            items = items.filter(self._fn_filter);
                        }
                        self.appendItems(items);
                    }
                }
                break;
            case COLL_CHANGE_TYPE.Remove:
                {
                    items.forEach(function (item) {
                        let key = item._key;
                        item = self._itemsByKey[key];
                        if (!!item) {
                            self.removeItem(item);
                        }
                    });
                }
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    item = self._itemsByKey[args.old_key];
                    if (!!item) {
                        delete self._itemsByKey[args.old_key];
                        self._itemsByKey[args.new_key] = <any>item;
                        this._onCollectionChanged(args);
                    }
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
        }
    }
    protected _onDSStatusChanged(sender: any, args: ICollItemStatusArgs<TItem>) {
        let self = this, item = args.item, key = args.key, oldStatus = args.oldStatus, isOk: boolean, canFilter = !!self._fn_filter;
        if (!!self._itemsByKey[key]) {
            self._onItemStatusChanged(item, oldStatus);

            if (canFilter) {
                isOk = self._fn_filter(item);
                if (!isOk) {
                    self.removeItem(item);
                }
            }
        }
        else {
            if (canFilter) {
                isOk = self._fn_filter(item);
                if (isOk) {
                    self.appendItems([item]);
                }
            }
        }
    }
    protected _bindDS() {
        let self = this, ds = this._dataSource;
        if (!ds) return;
        ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self, true);
        ds.addOnBeginEdit(function (sender, args) {
            if (!!self._itemsByKey[args.item._key]) {
                self._onEditing(args.item, true, false);
            }
        }, self._objId);
        ds.addOnEndEdit(function (sender, args) {
            let isOk: boolean, item = args.item, canFilter = !!self._fn_filter;
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
        }, self._objId);
        ds.addOnErrorsChanged(function (sender, args) {
            if (!!self._itemsByKey[args.item._key]) {
                self._onErrorsChanged(args.item);
            }
        }, self._objId);
        ds.addOnStatusChanged(self._onDSStatusChanged, self._objId, self);

        ds.addOnItemDeleting(function (sender, args) {
            if (!!self._itemsByKey[args.item._key]) {
                self._onItemDeleting(args);
            }
        }, self._objId);
        ds.addOnItemAdded(function (sender, args) {
            if (self._isAddingNew) {
                if (!self._itemsByKey[args.item._key]) {
                    self._attach(args.item);
                }
                self.currentItem = args.item;
                self._onEditing(args.item, true, false);
                self._onItemAdded(args.item);
            }
        }, self._objId);
        ds.addOnItemAdding(function (sender, args) {
            if (self._isAddingNew) {
                self._onItemAdding(args.item);
            }
        }, self._objId);
    }
    protected _unbindDS() {
        let self = this, ds = this._dataSource;
        if (!ds) return;
        ds.removeNSHandlers(self._objId);
    }
    protected _onCurrentChanging(newCurrent: TItem) {
        let ds = this._dataSource, item: TItem;
        try {
            item = (<BaseCollection<TItem>>ds)._getInternal().getEditingItem();
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
    _getErrors(item: TItem): IErrors {
        return (<BaseCollection<TItem>>this._dataSource)._getInternal().getErrors(item);
    }
    getItemsWithErrors() {
        let ds = this._dataSource;
        return ds.getItemsWithErrors();
    }
    appendItems(items: TItem[]) {
        if (this._isDestroyCalled)
            return [];
        return this._fillItems({ items: items, reason: COLL_CHANGE_REASON.None, clear: false, isAppend: true });
    }
    addNew() {
        let item: TItem;
        this._isAddingNew = true;
        try {
            item = this._dataSource.addNew();
        } finally {
            this._isAddingNew = false;
        }
        return item;
    }
    removeItem(item: TItem) {
        if (item._key === null) {
            throw new Error(ERRS.ERR_ITEM_IS_DETACHED);
        }
        if (!this._itemsByKey[item._key])
            return;
        let oldPos = ArrayHelper.remove(this._items, item);
        if (oldPos < 0) {
            throw new Error(ERRS.ERR_ITEM_IS_NOTFOUND);
        }
        delete this._itemsByKey[item._key];
        delete this._errors[item._key];
        this.totalCount = this.totalCount - 1;
        this._onRemoved(item, oldPos);
        let test = this.getItemByPos(oldPos), curPos = this._currentPos;
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
    sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any> {
        let mult = 1, deferred = _async.createDeferred<void>();
        if (sortOrder === SORT_ORDER.DESC)
            mult = -1;
        let fn_sort = function (a: any, b: any): number {
            let res = 0, i: number, len: number, af: any, bf: any, fieldName: string;
            for (i = 0, len = fieldNames.length; i < len; i += 1) {
                fieldName = fieldNames[i];
                af = parser.resolvePath(a, fieldName);
                bf = parser.resolvePath(b, fieldName);
                if (af < bf)
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
        try {
            this.fn_sort = fn_sort;
            deferred.resolve();
        } catch (ex) {
            deferred.reject(ex);
            this.handleError(ex, this);
        }
        return deferred.promise();
    }
    getIsHasErrors() {
        return this._dataSource.getIsHasErrors();
    }
    clear() {
        this._clear(COLL_CHANGE_REASON.None, COLL_CHANGE_OPER.None);
        this.totalCount = 0;
    }
    refresh(): void {
        this._refreshDebounce.enqueue(() => {
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
    get dataSource() { return this._dataSource; }
    get isPagingEnabled() { return this._options.enablePaging; }
    set isPagingEnabled(v) {
        if (this._options.enablePaging !== v) {
            this._options.enablePaging = v;
            this.raisePropertyChanged(PROP_NAME.isPagingEnabled);
            this._refresh(COLL_CHANGE_REASON.None);
        }
    }
    get permissions() { return this._dataSource.permissions; }
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