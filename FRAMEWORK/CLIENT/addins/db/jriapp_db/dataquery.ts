/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, FILTER_TYPE, SORT_ORDER } from "jriapp_core/const";
import { IPromise, IFieldInfo } from "jriapp_core/shared";
import * as langMOD from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Utils } from "jriapp_utils/utils";
import { valueUtils } from "jriapp_collection/utils";
import { PROP_NAME } from "./const";
import { IEntityItem, IQueryInfo, IFilterInfo, ISortInfo, IQueryResult, IEntityConstructor } from "./int";
import { DataCache } from "./datacache";
import { DbSet } from "./dbset";
import { DbContext } from "./dbcontext";

const utils = Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, arrHelper = utils.arr,
    valUtils = valueUtils;

export interface IInternalQueryMethods<TItem extends IEntityItem> {
    clearCache(): void;
    getCache(): DataCache;
    reindexCache(): void;
    isPageCached(pageIndex: number): boolean;
    getQueryInfo(): IQueryInfo;
}

export class DataQuery<TItem extends IEntityItem> extends BaseObject {
    private _dbSet: DbSet<TItem, DbContext>;
    private __queryInfo: IQueryInfo;
    private _filterInfo: IFilterInfo;
    private _sortInfo: ISortInfo;
    private _isIncludeTotalCount: boolean;
    private _isClearPrevData: boolean;
    private _pageSize: number;
    private _pageIndex: number;
    private _params: { [name: string]: any; };
    private _loadPageCount: number;
    private _isClearCacheOnEveryLoad: boolean;
    private _dataCache: DataCache;
    private _cacheInvalidated: boolean;
    private _internal: IInternalQueryMethods<TItem>;
    private _isPagingEnabled: boolean;

    constructor(dbSet: DbSet<TItem, DbContext>, queryInfo: IQueryInfo) {
        super();
        let self = this;
        this._dbSet = dbSet;
        this.__queryInfo = queryInfo;
        this._filterInfo = { filterItems: [] };
        this._sortInfo = { sortItems: [] };
        this._isIncludeTotalCount = true;
        this._isClearPrevData = true;
        this._pageSize = dbSet.pageSize;
        this._pageIndex = dbSet.pageIndex;
        this._params = {};
        this._loadPageCount = 1;
        this._isClearCacheOnEveryLoad = true;
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
            reindexCache: () => {
                self._reindexCache();
           },
            isPageCached: (pageIndex: number) => {
                return self._isPageCached(pageIndex);
           },
            getQueryInfo: () => {
                return self.__queryInfo;
           }
       };
   }
    private _addSort(fieldName: string, sortOrder: SORT_ORDER) {
        let ord = SORT_ORDER.ASC;
        if (!checks.isNt(sortOrder))
            ord = sortOrder;

        let sortItem = { fieldName: fieldName, sortOrder: ord };
        this._sortInfo.sortItems.push(sortItem);
        this._cacheInvalidated = true;
   }
    private _addFilterItem(fieldName: string, operand: FILTER_TYPE, value: any[]) {
        let fkind = FILTER_TYPE.Equals;
        let fld = this.getFieldInfo(fieldName);
        if (!fld)
            throw new Error(strUtils.format(langMOD.ERRS.ERR_DBSET_INVALID_FIELDNAME, this.dbSetName, fieldName));
        let stz = this.serverTimezone, dcnv = fld.dateConversion, vals: any[] = [];
        if (!checks.isArray(value))
            vals = [value];
        else
            vals = value;
        let tmpVals = arrHelper.clone(vals);
        vals = tmpVals.map(function (v) {
            return valUtils.stringifyValue(v, dcnv, fld.dataType, stz);
       });

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
                if (value.length !== 2)
                    throw new Error(langMOD.ERRS.ERR_QUERY_BETWEEN);
                break;
            default:
                throw new Error(strUtils.format(langMOD.ERRS.ERR_QUERY_OPERATOR_INVALID, operand));
       }
        let filterItem = { fieldName: fieldName, kind: fkind, values: vals };
        this._filterInfo.filterItems.push(filterItem);
        this._cacheInvalidated = true;
   }
    private _resetCacheInvalidated() {
        this._cacheInvalidated = false;
   }
    private _clearCache(): void {
        if (!!this._dataCache) {
            this._dataCache.destroy();
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
    private _reindexCache(): void {
        if (!this._dataCache) {
            return;
       }
        this._dataCache.reindexCache();
   }
    private _isPageCached(pageIndex: number): boolean {
        if (!this._dataCache) {
            return false;
       }
        return this._dataCache.hasPage(pageIndex);
   }
    _getInternal(): IInternalQueryMethods<TItem> {
        return this._internal;
   }
    where(fieldName: string, operand: FILTER_TYPE, value: any) {
        this._addFilterItem(fieldName, operand, value);
        return this;
   }
    and(fieldName: string, operand: FILTER_TYPE, value: any) {
        this._addFilterItem(fieldName, operand, value);
        return this;
   }
    orderBy(fieldName: string, sortOrder?: SORT_ORDER) {
        this._addSort(fieldName, sortOrder);
        return this;
   }
    thenBy(fieldName: string, sortOrder?: SORT_ORDER) {
        this._addSort(fieldName, sortOrder);
        return this;
   }
    clearSort() {
        this._sortInfo.sortItems = [];
        this._cacheInvalidated = true;
        return this;
   }
    clearFilter() {
        this._filterInfo.filterItems = [];
        this._cacheInvalidated = true;
        return this;
   }
    clearParams() {
        this._params = {};
        this._cacheInvalidated = true;
        return this;
   }
    getFieldInfo(fieldName: string): IFieldInfo {
        return this._dbSet.getFieldInfo(fieldName);
   }
    getFieldNames() {
        return this._dbSet.getFieldNames();
   }
    load(): IPromise<IQueryResult<TItem>> {
        return <IPromise<IQueryResult<TItem>>>this.dbSet.dbContext.load(this);
   }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._clearCache();
        super.destroy();
   }
    toString() {
        return "DataQuery";
   }
    get serverTimezone() { return this._dbSet.dbContext.serverTimezone; }
    get entityType() { return this._dbSet.entityType; }
    get dbSet() { return this._dbSet; }
    get dbSetName() { return this._dbSet.dbSetName; }
    get queryName() { return this.__queryInfo.methodName; }
    get filterInfo() { return this._filterInfo; }
    get sortInfo() { return this._sortInfo; }
    get isIncludeTotalCount() { return this._isIncludeTotalCount; }
    set isIncludeTotalCount(v: boolean) { this._isIncludeTotalCount = v; }
    get isClearPrevData() { return this._isClearPrevData; }
    set isClearPrevData(v: boolean) { this._isClearPrevData = v; }
    get pageSize() { return this._pageSize; }
    set pageSize(v: number) {
        if (this._pageSize !== v) {
            this._pageSize = v;
       }
   }
    get pageIndex() { return this._pageIndex; }
    set pageIndex(v: number) {
        if (this._pageIndex !== v) {
            this._pageIndex = v;
       }
   }
    get params() { return this._params; }
    set params(v: any) {
        if (this._params !== v) {
            this._params = v;
            this._cacheInvalidated = true;
       }
   }
    get isPagingEnabled() { return this._isPagingEnabled; }
    set isPagingEnabled(v: boolean) {
        this._isPagingEnabled = v;
   }
    get loadPageCount() { return this._loadPageCount; }
    set loadPageCount(v: number) {
        if (v < 1) {
            v = 1;
       }
        if (this._loadPageCount !== v) {
            this._loadPageCount = v;
            if (v === 1) {
                this._clearCache();
           }
            this.raisePropertyChanged(PROP_NAME.loadPageCount);
       }
   }
    get isClearCacheOnEveryLoad() { return this._isClearCacheOnEveryLoad; }
    set isClearCacheOnEveryLoad(v) {
        if (this._isClearCacheOnEveryLoad !== v) {
            this._isClearCacheOnEveryLoad = v;
            this.raisePropertyChanged(PROP_NAME.isClearCacheOnEveryLoad);
       }
   }
    get isCacheValid() { return !!this._dataCache && !this._cacheInvalidated; }
}

export type TDataQuery = DataQuery<IEntityItem>;