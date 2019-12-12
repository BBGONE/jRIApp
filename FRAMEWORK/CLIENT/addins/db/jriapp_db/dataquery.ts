/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { FILTER_TYPE, SORT_ORDER, DATE_CONVERSION, DATA_TYPE } from "jriapp_shared/collection/const";
import { IStatefulPromise, BaseObject, Utils, IIndexer, LocaleERRS as ERRS } from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { ValueUtils } from "jriapp_shared/collection/utils";
import { IEntityItem, IQueryInfo, IFilterInfo, ISortInfo, IQueryResult } from "./int";
import { DataCache } from "./datacache";
import { DbSet } from "./dbset";
import { DbContext } from "./dbcontext";

const utils = Utils, { isNt, isArray, isDate } = utils.check, { format } = utils.str, { Indexer } = utils.core,
    arrHelper = utils.arr, valUtils = ValueUtils;

export interface IInternalQueryMethods {
    clearCache(): void;
    getCache(): DataCache;
    isPageCached(pageIndex: number): boolean;
    updateCache(pageIndex: number, items: IEntityItem[]): void;
    getQueryInfo(): IQueryInfo;
}

export class DataQuery<TItem extends IEntityItem = IEntityItem, TObj = any> extends BaseObject {
    private _dbSet: DbSet<TItem, TObj, DbContext>;
    private _queryInfo: IQueryInfo;
    private _filterInfo: IFilterInfo;
    private _sortInfo: ISortInfo;
    private _isIncludeTotalCount: boolean;
    private _isClearPrevData: boolean;
    private _pageSize: number;
    private _pageIndex: number;
    private _params: IIndexer<any>;
    private _loadPageCount: number;
    private _isClearCacheOnEveryLoad: boolean;
    private _isForAppend: boolean;
    private _dataCache: DataCache;
    private _cacheInvalidated: boolean;
    private _internal: IInternalQueryMethods;
    private _isPagingEnabled: boolean;

    constructor(dbSet: DbSet<TItem, TObj, DbContext>, queryInfo: IQueryInfo) {
        super();
        const self = this;
        this._dbSet = dbSet;
        this._queryInfo = queryInfo;
        this._filterInfo = { filterItems: [] };
        this._sortInfo = { sortItems: [] };
        this._isIncludeTotalCount = true;
        this._isClearPrevData = true;
        this._pageSize = dbSet.pageSize;
        this._pageIndex = dbSet.pageIndex;
        this._params = Indexer();
        this._loadPageCount = 1;
        this._isClearCacheOnEveryLoad = true;
        this._isForAppend = false;
        this._dataCache = null;
        this._cacheInvalidated = false;
        this._isPagingEnabled = dbSet.isPagingEnabled;
        this._internal = {
            clearCache: () => {
                self._clearCache();
            },
            getCache: () => {
                return self._getCache();
            },
            isPageCached: (pageIndex: number) => {
                return self._isPageCached(pageIndex);
            },
            updateCache: (pageIndex: number, items: IEntityItem[]) => {
                self._updateCache(pageIndex, items);
            },
            getQueryInfo: () => {
                return self._queryInfo;
            }
        };
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._clearCache();
        super.dispose();
    }
    private _addSort(fieldName: string, sortOrder: SORT_ORDER): void {
        const ord = !isNt(sortOrder) ? sortOrder : SORT_ORDER.ASC;
        const sortItem = { fieldName: fieldName, sortOrder: ord };
        this._sortInfo.sortItems.push(sortItem);
        this._cacheInvalidated = true;
    }
    private _addFilterItem(fieldName: string, operand: FILTER_TYPE, value: any[], checkFieldName = true): void {
        let fkind = FILTER_TYPE.Equals, vals: any[] = [];
        const stz = this.serverTimezone;
        if (!isArray(value)) {
            vals = [value];
        } else {
            vals = value;
        }

        const tmpVals = arrHelper.clone(vals);
        let fld: IFieldInfo = null;
        if (checkFieldName) {
            fld = this.getFieldInfo(fieldName);
        }

        if (!!fld) {
            vals = tmpVals.map((v) => valUtils.stringifyValue(v, fld.dateConversion, fld.dataType, stz));
        } else {
            vals = tmpVals.map((v) => valUtils.stringifyValue(v, DATE_CONVERSION.None, isDate(v) ? DATA_TYPE.Date : DATA_TYPE.None, stz));
        }

        switch (operand) {
            case FILTER_TYPE.Equals:
            case FILTER_TYPE.NotEq:
            case FILTER_TYPE.StartsWith:
            case FILTER_TYPE.EndsWith:
            case FILTER_TYPE.Contains:
            case FILTER_TYPE.Gt:
            case FILTER_TYPE.GtEq:
            case FILTER_TYPE.Lt:
            case FILTER_TYPE.LtEq:
                fkind = operand;
                break;
            case FILTER_TYPE.Between:
                fkind = operand;
                if (value.length !== 2) {
                    throw new Error(ERRS.ERR_QUERY_BETWEEN);
                }
                break;
            default:
                throw new Error(format(ERRS.ERR_QUERY_OPERATOR_INVALID, operand));
        }

        const filterItem = { fieldName: fieldName, kind: fkind, values: vals };
        this._filterInfo.filterItems.push(filterItem);
        this._cacheInvalidated = true;
    }
    private _resetCacheInvalidated(): void {
        this._cacheInvalidated = false;
    }
    private _clearCache(): void {
        if (!!this._dataCache) {
            this._dataCache.dispose();
            this._dataCache = null;
        }
        this._resetCacheInvalidated();
    }
    private _getCache(): DataCache {
        if (!this._dataCache) {
            this._dataCache = new DataCache(this);
        }
        return this._dataCache;
    }
    private _isPageCached(pageIndex: number): boolean {
        if (!this._dataCache) {
            return false;
        }
        return this._dataCache.hasPage(pageIndex);
    }
    private _updateCache(pageIndex: number, items: IEntityItem[]): void {
        const cache = this._dataCache;
        if (!cache) {
            return;
        }
        cache.setPageItems(pageIndex, items);
    }
    _getInternal(): IInternalQueryMethods {
        return this._internal;
    }
    where(fieldName: string, operand: FILTER_TYPE, value: any, checkFieldName = true): this {
        this._addFilterItem(fieldName, operand, value, checkFieldName);
        return this;
    }
    and(fieldName: string, operand: FILTER_TYPE, value: any, checkFieldName = true): this {
        this._addFilterItem(fieldName, operand, value, checkFieldName);
        return this;
    }
    orderBy(fieldName: string, sortOrder?: SORT_ORDER): this {
        this._addSort(fieldName, sortOrder);
        return this;
    }
    thenBy(fieldName: string, sortOrder?: SORT_ORDER): this {
        this._addSort(fieldName, sortOrder);
        return this;
    }
    clearSort(): this {
        this._sortInfo.sortItems = [];
        this._cacheInvalidated = true;
        return this;
    }
    clearFilter(): this {
        this._filterInfo.filterItems = [];
        this._cacheInvalidated = true;
        return this;
    }
    clearParams(): this {
        this._params = Indexer();
        this._cacheInvalidated = true;
        return this;
    }
    getFieldInfo(fieldName: string): IFieldInfo {
        return this._dbSet.getFieldInfo(fieldName);
    }
    getFieldNames(): string[] {
        return this._dbSet.getFieldNames();
    }
    load(): IStatefulPromise<IQueryResult<TItem>> {
        return <IStatefulPromise<IQueryResult<TItem>>>this.dbSet.dbContext.load(this);
    }
    toString(): string {
        return "DataQuery";
    }
    get serverTimezone(): number {
        return this._dbSet.dbContext.serverTimezone;
    }
    get dbSet(): DbSet<TItem, TObj, DbContext> {
        return this._dbSet;
    }
    get dbSetName(): string {
        return this._dbSet.dbSetName;
    }
    get queryName(): string {
        return this._queryInfo.methodName;
    }
    get filterInfo(): IFilterInfo {
        return this._filterInfo;
    }
    get sortInfo(): ISortInfo {
        return this._sortInfo;
    }
    get isIncludeTotalCount(): boolean {
        return this._isIncludeTotalCount && !this.isForAppend;
    }
    set isIncludeTotalCount(v: boolean) {
        this._isIncludeTotalCount = v;
    }
    get isClearPrevData(): boolean {
        return this._isClearPrevData && !this.isForAppend;
    }
    set isClearPrevData(v: boolean) {
        this._isClearPrevData = v;
    }
    get pageSize(): number {
        return this._pageSize;
    }
    set pageSize(v: number) {
        if (this._pageSize !== v) {
            this._pageSize = v;
        }
    }
    get pageIndex(): number {
        return this._pageIndex;
    }
    set pageIndex(v: number) {
        if (this._pageIndex !== v) {
            this._pageIndex = v;
        }
    }
    get params(): { [name: string]: any; } {
        return this._params;
    }
    set params(v: { [name: string]: any; }) {
        if (this._params !== v) {
            this._params = v;
            this._cacheInvalidated = true;
        }
    }
    get isPagingEnabled(): boolean {
        return this._isPagingEnabled && !this.isForAppend;
    }
    set isPagingEnabled(v: boolean) {
        this._isPagingEnabled = v;
    }
    get loadPageCount(): number {
        return this.isForAppend ? 1 : this._loadPageCount;
    }
    set loadPageCount(v: number) {
        if (v < 1) {
            v = 1;
        }
        if (this._loadPageCount !== v) {
            this._loadPageCount = v;
            if (v === 1 || this.isForAppend) {
                this._clearCache();
            }
            this.objEvents.raiseProp("loadPageCount");
        }
    }
    get isClearCacheOnEveryLoad(): boolean {
        return this._isClearCacheOnEveryLoad || this.isForAppend;
    }
    set isClearCacheOnEveryLoad(v: boolean) {
        if (this._isClearCacheOnEveryLoad !== v) {
            this._isClearCacheOnEveryLoad = v;
            this.objEvents.raiseProp("isClearCacheOnEveryLoad");
        }
    }
    get isForAppend(): boolean {
        return this._isForAppend;
    }
    set isForAppend(v: boolean) {
        if (this._isForAppend !== v) {
            this._isForAppend = v;
            this.objEvents.raiseProp("isForAppend");
        }
    }
    get isCacheValid(): boolean {
        return !!this._dataCache && !this._cacheInvalidated && !this.isForAppend;
    }
}

export type TDataQuery = DataQuery;