/// <reference path="jriapp.d.ts" />
declare module "jriapp_db/const" {
    export const enum FLAGS {
        None = 0,
        Changed = 1,
        Setted = 2,
        Refreshed = 4,
    }
    export const enum REFRESH_MODE {
        NONE = 0,
        RefreshCurrent = 1,
        MergeIntoCurrent = 2,
        CommitChanges = 3,
    }
    export const enum DELETE_ACTION {
        NoAction = 0,
        Cascade = 1,
        SetNulls = 2,
    }
    export const enum DATA_OPER {
        None = 0,
        Submit = 1,
        Query = 2,
        Invoke = 3,
        Refresh = 4,
        Init = 5,
    }
    export const PROP_NAME: {
        isHasChanges: string;
        isSubmitOnDelete: string;
        isInitialized: string;
        isBusy: string;
        isSubmiting: string;
        isPagingEnabled: string;
        parentItem: string;
        totalCount: string;
        loadPageCount: string;
        isClearCacheOnEveryLoad: string;
        isRefreshing: string;
        requestCount: string;
        isLoading: string;
    };
}
declare module "jriapp_db/dataquery" {
    import { FILTER_TYPE, SORT_ORDER } from "jriapp_core/const";
    import { IPromise, IFieldInfo } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { IEntityItem, IQueryInfo, IFilterInfo, ISortInfo, IQueryResult, IEntityConstructor } from "jriapp_db/int";
    import { DataCache } from "jriapp_db/datacache";
    import { DbSet } from "jriapp_db/dbset";
    import { DbContext } from "jriapp_db/dbcontext";
    export interface IInternalQueryMethods<TItem extends IEntityItem> {
        clearCache(): void;
        getCache(): DataCache;
        reindexCache(): void;
        isPageCached(pageIndex: number): boolean;
        getQueryInfo(): IQueryInfo;
    }
    export class DataQuery<TItem extends IEntityItem> extends BaseObject {
        private _dbSet;
        private __queryInfo;
        private _filterInfo;
        private _sortInfo;
        private _isIncludeTotalCount;
        private _isClearPrevData;
        private _pageSize;
        private _pageIndex;
        private _params;
        private _loadPageCount;
        private _isClearCacheOnEveryLoad;
        private _dataCache;
        private _cacheInvalidated;
        private _internal;
        private _isPagingEnabled;
        constructor(dbSet: DbSet<TItem, DbContext>, queryInfo: IQueryInfo);
        private _addSort(fieldName, sortOrder);
        private _addFilterItem(fieldName, operand, value);
        private _resetCacheInvalidated();
        private _clearCache();
        private _getCache();
        private _reindexCache();
        private _isPageCached(pageIndex);
        _getInternal(): IInternalQueryMethods<TItem>;
        where(fieldName: string, operand: FILTER_TYPE, value: any): this;
        and(fieldName: string, operand: FILTER_TYPE, value: any): this;
        orderBy(fieldName: string, sortOrder?: SORT_ORDER): this;
        thenBy(fieldName: string, sortOrder?: SORT_ORDER): this;
        clearSort(): this;
        clearFilter(): this;
        clearParams(): this;
        getFieldInfo(fieldName: string): IFieldInfo;
        getFieldNames(): string[];
        load(): IPromise<IQueryResult<TItem>>;
        destroy(): void;
        toString(): string;
        readonly serverTimezone: number;
        readonly entityType: IEntityConstructor<TItem>;
        readonly dbSet: DbSet<TItem, DbContext>;
        readonly dbSetName: string;
        readonly queryName: string;
        readonly filterInfo: IFilterInfo;
        readonly sortInfo: ISortInfo;
        isIncludeTotalCount: boolean;
        isClearPrevData: boolean;
        pageSize: number;
        pageIndex: number;
        params: any;
        isPagingEnabled: boolean;
        loadPageCount: number;
        isClearCacheOnEveryLoad: boolean;
        readonly isCacheValid: boolean;
    }
    export type TDataQuery = DataQuery<IEntityItem>;
}
declare module "jriapp_db/datacache" {
    import { BaseObject } from "jriapp_core/object";
    import { DataQuery } from "jriapp_db/dataquery";
    import { IEntityItem } from "jriapp_db/int";
    export interface ICachedPage {
        items: IEntityItem[];
        pageIndex: number;
    }
    export class DataCache extends BaseObject {
        private _query;
        private _cache;
        private _totalCount;
        private _itemsByKey;
        constructor(query: DataQuery<IEntityItem>);
        getCachedPage(pageIndex: number): ICachedPage;
        reindexCache(): void;
        getPrevCachedPageIndex(currentPageIndex: number): number;
        getNextRange(pageIndex: number): {
            start: number;
            end: number;
            cnt: number;
        };
        fillCache(start: number, items: IEntityItem[]): void;
        clear(): void;
        clearCacheForPage(pageIndex: number): void;
        hasPage(pageIndex: number): boolean;
        getItemByKey(key: string): IEntityItem;
        getPageByItem(item: IEntityItem): number;
        destroy(): void;
        toString(): string;
        readonly _pageCount: number;
        readonly pageSize: number;
        readonly loadPageCount: number;
        totalCount: number;
        readonly cacheSize: number;
    }
}
declare module "jriapp_db/dbset" {
    import { SORT_ORDER } from "jriapp_core/const";
    import { IFieldInfo, TEventHandler, IBaseObject, IPromise } from "jriapp_core/shared";
    import { COLL_CHANGE_REASON, ITEM_STATUS, IInternalCollMethods, BaseCollection } from "jriapp_collection/collection";
    import { IFieldName, IEntityItem, IEntityConstructor, IRowInfo, ITrackAssoc, IQueryResponse, IPermissions, IDbSetConstuctorOptions, IDbSetOptions, ICalcFieldImpl, INavFieldImpl, IQueryResult, IRowData, IDbSetLoadedArgs } from "jriapp_db/int";
    import { REFRESH_MODE } from "jriapp_db/const";
    import { DataQuery } from "jriapp_db/dataquery";
    import { DbContext } from "jriapp_db/dbcontext";
    export interface IFillFromServiceArgs {
        res: IQueryResponse;
        reason: COLL_CHANGE_REASON;
        query: DataQuery<IEntityItem>;
        onFillEnd: () => void;
    }
    export interface IFillFromCacheArgs {
        reason: COLL_CHANGE_REASON;
        query: DataQuery<IEntityItem>;
    }
    export interface IInternalDbSetMethods<TItem extends IEntityItem> extends IInternalCollMethods<TItem> {
        getCalcFieldVal(fieldName: string, item: IEntityItem): any;
        getNavFieldVal(fieldName: string, item: IEntityItem): any;
        setNavFieldVal(fieldName: string, item: IEntityItem, value: any): void;
        beforeLoad(query: DataQuery<TItem>, oldQuery: DataQuery<TItem>): void;
        updatePermissions(perms: IPermissions): void;
        getChildToParentNames(childFieldName: string): string[];
        fillFromService(info: IFillFromServiceArgs): IQueryResult<TItem>;
        fillFromCache(info: IFillFromCacheArgs): IQueryResult<TItem>;
        commitChanges(rows: IRowInfo[]): void;
        setItemInvalid(row: IRowInfo): TItem;
        getChanges(): IRowInfo[];
        getTrackAssocInfo(): ITrackAssoc[];
        addToChanged(item: TItem): void;
        removeFromChanged(key: string): void;
        onItemStatusChanged(item: TItem, oldStatus: ITEM_STATUS): void;
    }
    export interface IDbSetConstructor<TItem extends IEntityItem> {
        new (dbContext: DbContext): DbSet<TItem, DbContext>;
    }
    export class DbSet<TItem extends IEntityItem, TDbContext extends DbContext> extends BaseCollection<TItem> {
        private _dbContext;
        private _isSubmitOnDelete;
        private _trackAssoc;
        private _trackAssocMap;
        private _childAssocMap;
        private _parentAssocMap;
        private _changeCount;
        private _changeCache;
        protected _options: IDbSetOptions;
        protected _navfldMap: {
            [fieldName: string]: INavFieldImpl<TItem>;
        };
        protected _calcfldMap: {
            [fieldName: string]: ICalcFieldImpl<TItem>;
        };
        protected _itemsByKey: {
            [key: string]: TItem;
        };
        protected _entityType: IEntityConstructor<TItem>;
        protected _ignorePageChanged: boolean;
        protected _query: DataQuery<TItem>;
        private _pageDebounce;
        constructor(opts: IDbSetConstuctorOptions);
        handleError(error: any, source: any): boolean;
        protected _getEventNames(): string[];
        protected _mapAssocFields(): void;
        protected _doNavigationField(opts: IDbSetConstuctorOptions, fieldInfo: IFieldInfo): INavFieldImpl<TItem>;
        protected _doCalculatedField(opts: IDbSetConstuctorOptions, fieldInfo: IFieldInfo): ICalcFieldImpl<TItem>;
        protected _refreshValues(path: string, item: IEntityItem, values: any[], names: IFieldName[], rm: REFRESH_MODE): void;
        protected _setCurrentItem(v: TItem): void;
        protected _getNewKey(item: TItem): string;
        protected _createNew(): TItem;
        protected _clearChangeCache(): void;
        protected _onPageChanging(): boolean;
        protected _onPageChanged(): void;
        protected _onPageSizeChanged(): void;
        protected _defineCalculatedField(fullName: string, getFunc: (item: TItem) => any): void;
        protected _getStrValue(val: any, fieldInfo: IFieldInfo): string;
        protected _getCalcFieldVal(fieldName: string, item: TItem): any;
        protected _getNavFieldVal(fieldName: string, item: TItem): any;
        protected _setNavFieldVal(fieldName: string, item: TItem, value: any): void;
        protected _beforeLoad(query: DataQuery<TItem>, oldQuery: DataQuery<TItem>): void;
        protected _updatePermissions(perms: IPermissions): void;
        protected _getChildToParentNames(childFieldName: string): string[];
        protected _afterFill(result: IQueryResult<TItem>, isClearAll?: boolean): void;
        protected _fillFromService(info: IFillFromServiceArgs): IQueryResult<TItem>;
        protected _fillFromCache(info: IFillFromCacheArgs): IQueryResult<TItem>;
        protected _commitChanges(rows: IRowInfo[]): void;
        protected _setItemInvalid(row: IRowInfo): TItem;
        protected _getChanges(): IRowInfo[];
        protected _getTrackAssocInfo(): ITrackAssoc[];
        protected _addToChanged(item: TItem): void;
        protected _removeFromChanged(key: string): void;
        protected _onItemStatusChanged(item: TItem, oldStatus: ITEM_STATUS): void;
        protected _onRemoved(item: TItem, pos: number): void;
        protected _onLoaded(items: TItem[]): void;
        protected _destroyQuery(): void;
        protected _getPKFields(): IFieldInfo[];
        protected _getNames(): IFieldName[];
        protected createEntity(row: IRowData, fieldNames: IFieldName[]): TItem;
        _getInternal(): IInternalDbSetMethods<TItem>;
        addOnLoaded(fn: TEventHandler<DbSet<TItem, TDbContext>, IDbSetLoadedArgs<TItem>>, nmspace?: string, context?: IBaseObject): void;
        removeOnLoaded(nmspace?: string): void;
        waitForNotBusy(callback: () => void, groupName: string): void;
        getFieldInfo(fieldName: string): IFieldInfo;
        sort(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
        fillData(data: {
            names: IFieldName[];
            rows: IRowData[];
        }, isAppendData?: boolean): IQueryResult<TItem>;
        fillItems<TObj>(data: TObj[], isAppend?: boolean): IQueryResult<TItem>;
        acceptChanges(): void;
        rejectChanges(): void;
        deleteOnSubmit(item: TItem): void;
        clear(): void;
        createQuery(name: string): DataQuery<TItem>;
        destroy(): void;
        toString(): string;
        readonly items: TItem[];
        readonly dbContext: TDbContext;
        readonly dbSetName: string;
        readonly entityType: IEntityConstructor<TItem>;
        readonly query: DataQuery<TItem>;
        readonly isHasChanges: boolean;
        readonly cacheSize: number;
        isSubmitOnDelete: boolean;
        readonly isBusy: boolean;
    }
    export type TDbSet = DbSet<IEntityItem, DbContext>;
}
declare module "jriapp_db/dbsets" {
    import { BaseObject } from "jriapp_core/object";
    import { IEntityItem } from "jriapp_db/int";
    import { DbContext } from "jriapp_db/dbcontext";
    import { DbSet, IDbSetConstructor } from "jriapp_db/dbset";
    export class DbSets extends BaseObject {
        private _dbContext;
        private _dbSets;
        private _arrDbSets;
        constructor(dbContext: DbContext);
        protected _dbSetCreated(dbSet: DbSet<IEntityItem, DbContext>): void;
        protected _createDbSet(name: string, dbSetType: IDbSetConstructor<IEntityItem>): void;
        readonly dbSetNames: string[];
        readonly arrDbSets: DbSet<IEntityItem, DbContext>[];
        getDbSet(name: string): DbSet<IEntityItem, DbContext>;
        destroy(): void;
    }
}
declare module "jriapp_db/association" {
    import { IFieldInfo } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { ICollChangedArgs, ITEM_STATUS } from "jriapp_collection/collection";
    import { DELETE_ACTION } from "jriapp_db/const";
    import { IAssocConstructorOptions, IEntityItem } from "jriapp_db/int";
    import { DbContext } from "jriapp_db/dbcontext";
    import { DbSet } from "jriapp_db/dbset";
    export class Association extends BaseObject {
        private _objId;
        private _name;
        private _dbContext;
        private _onDeleteAction;
        private _parentDS;
        private _childDS;
        private _parentFldInfos;
        private _childFldInfos;
        private _parentToChildrenName;
        private _childToParentName;
        private _parentMap;
        private _childMap;
        private _saveParentFKey;
        private _saveChildFKey;
        private _changedDebounce;
        private _changed;
        constructor(options: IAssocConstructorOptions);
        handleError(error: any, source: any): boolean;
        protected _bindParentDS(): void;
        protected _bindChildDS(): void;
        protected _onParentCollChanged(args: ICollChangedArgs<IEntityItem>): void;
        protected _onParentEdit(item: IEntityItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onParentCommitChanges(item: IEntityItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
        protected _storeParentFKey(item: IEntityItem): void;
        protected _checkParentFKey(item: IEntityItem): void;
        protected _onParentStatusChanged(item: IEntityItem, oldStatus: ITEM_STATUS): void;
        protected _onChildCollChanged(args: ICollChangedArgs<IEntityItem>): void;
        protected _notifyChildrenChanged(changed: string[]): void;
        protected _notifyParentChanged(changed: string[]): void;
        protected _notifyChanged(changed_pkeys: string[], changed_ckeys: string[]): void;
        protected _onChildEdit(item: IEntityItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onChildCommitChanges(item: IEntityItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
        protected _storeChildFKey(item: IEntityItem): void;
        protected _checkChildFKey(item: IEntityItem): void;
        protected _onChildStatusChanged(item: IEntityItem, oldStatus: ITEM_STATUS): void;
        protected _getItemKey(finf: IFieldInfo[], ds: DbSet<IEntityItem, DbContext>, item: IEntityItem): string;
        protected _resetChildMap(): void;
        protected _resetParentMap(): void;
        protected _unMapChildItem(item: IEntityItem): string;
        protected _unMapParentItem(item: IEntityItem): string;
        protected _mapParentItems(items: IEntityItem[]): string[];
        protected _onChildrenChanged(fkey: string, item: IEntityItem): void;
        protected _onParentChanged(fkey: string, items: IEntityItem[]): void;
        protected _mapChildren(items: IEntityItem[]): string[];
        protected _unbindParentDS(): void;
        protected _unbindChildDS(): void;
        getParentFKey(item: IEntityItem): string;
        getChildFKey(item: IEntityItem): string;
        getChildItems(item: IEntityItem): IEntityItem[];
        getParentItem(item: IEntityItem): IEntityItem;
        refreshParentMap(): string[];
        refreshChildMap(): string[];
        destroy(): void;
        toString(): string;
        readonly name: string;
        readonly parentToChildrenName: string;
        readonly childToParentName: string;
        readonly parentDS: DbSet<IEntityItem, DbContext>;
        readonly childDS: DbSet<IEntityItem, DbContext>;
        readonly parentFldInfos: IFieldInfo[];
        readonly childFldInfos: IFieldInfo[];
        readonly onDeleteAction: DELETE_ACTION;
    }
}
declare module "jriapp_db/error" {
    import { BaseError } from "jriapp_core/shared";
    import { IEntityItem } from "jriapp_db/int";
    import { DATA_OPER } from "jriapp_db/const";
    export class DataOperationError extends BaseError {
        private _operationName;
        protected _origError: any;
        constructor(originalError: any, operationName: DATA_OPER);
        readonly operationName: DATA_OPER;
        readonly origError: any;
    }
    export class AccessDeniedError extends DataOperationError {
    }
    export class ConcurrencyError extends DataOperationError {
    }
    export class SvcValidationError extends DataOperationError {
    }
    export class SubmitError extends DataOperationError {
        private _allSubmitted;
        private _notValidated;
        constructor(origError: any, allSubmitted: IEntityItem[], notValidated: IEntityItem[]);
        readonly allSubmitted: IEntityItem[];
        readonly notValidated: IEntityItem[];
    }
}
declare module "jriapp_db/dbcontext" {
    import { IIndexer, IVoidPromise, IBaseObject, TEventHandler } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { IPromise, IAbortablePromise } from "jriapp_utils/async";
    import { COLL_CHANGE_REASON } from "jriapp_collection/collection";
    import { IEntityItem, IRefreshRowInfo, IQueryResult, IQueryInfo, IAssociationInfo, IPermissionsInfo, IInvokeRequest, IQueryResponse, IChangeSet } from "jriapp_db/int";
    import { DATA_OPER } from "jriapp_db/const";
    import { DbSet } from "jriapp_db/dbset";
    import { DbSets } from "jriapp_db/dbsets";
    import { Association } from "jriapp_db/association";
    import { DataQuery } from "jriapp_db/dataquery";
    export interface IInternalDbxtMethods {
        onItemRefreshed(res: IRefreshRowInfo, item: IEntityItem): void;
        refreshItem(item: IEntityItem): IPromise<IEntityItem>;
        getQueryInfo(name: string): IQueryInfo;
        onDbSetHasChangesChanged(eSet: DbSet<IEntityItem, DbContext>): void;
        load(query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON): IPromise<IQueryResult<IEntityItem>>;
    }
    export class DbContext extends BaseObject {
        private _requestHeaders;
        private _requests;
        protected _initState: IPromise<any>;
        protected _dbSets: DbSets;
        protected _svcMethods: any;
        protected _assoc: any;
        private _arrAssoc;
        private _queryInf;
        private _serviceUrl;
        private _isSubmiting;
        private _isHasChanges;
        private _pendingSubmit;
        private _serverTimezone;
        private _waitQueue;
        private _internal;
        constructor();
        protected _getEventNames(): string[];
        protected _initDbSets(): void;
        protected _initAssociations(associations: IAssociationInfo[]): void;
        protected _initMethods(methods: IQueryInfo[]): void;
        protected _updatePermissions(info: IPermissionsInfo): void;
        protected _initAssociation(assoc: IAssociationInfo): void;
        protected _initMethod(methodInfo: IQueryInfo): void;
        protected _addRequestPromise(req: IAbortablePromise<any>, operType: DATA_OPER, name?: string): void;
        protected _tryAbortRequest(operType: DATA_OPER, name: string): void;
        protected _getMethodParams(methodInfo: IQueryInfo, args: {
            [paramName: string]: any;
        }): IInvokeRequest;
        protected _invokeMethod(methodInfo: IQueryInfo, data: IInvokeRequest, callback: (res: {
            result: any;
            error: any;
        }) => void): void;
        protected _loadFromCache(query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON): IPromise<IQueryResult<IEntityItem>>;
        protected _loadSubsets(res: IQueryResponse, isClearAll: boolean): void;
        protected _onLoaded(res: IQueryResponse, query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON): IPromise<IQueryResult<IEntityItem>>;
        protected _dataSaved(res: IChangeSet): void;
        protected _getChanges(): IChangeSet;
        protected _getUrl(action: string): string;
        handleError(error: any, source: any): boolean;
        protected _onDataOperError(ex: any, oper: DATA_OPER): boolean;
        protected _onSubmitError(error: any): void;
        protected waitForNotBusy(callback: () => void): void;
        protected waitForNotSubmiting(callback: () => void): void;
        protected _loadInternal(context: {
            query: DataQuery<IEntityItem>;
            reason: COLL_CHANGE_REASON;
            loadPageCount: number;
            pageIndex: number;
            isPagingEnabled: boolean;
            dbSetName: string;
            dbSet: DbSet<IEntityItem, DbContext>;
            fn_onStart: () => void;
            fn_onEnd: () => void;
            fn_onOK: (res: IQueryResult<IEntityItem>) => void;
            fn_onErr: (ex: any) => void;
        }): void;
        protected _onItemRefreshed(res: IRefreshRowInfo, item: IEntityItem): void;
        protected _loadRefresh(args: {
            item: IEntityItem;
            dbSet: DbSet<IEntityItem, DbContext>;
            fn_onStart: () => void;
            fn_onEnd: () => void;
            fn_onErr: (ex: any) => void;
            fn_onOK: (res: IRefreshRowInfo) => void;
        }): void;
        protected _refreshItem(item: IEntityItem): IPromise<IEntityItem>;
        protected _getQueryInfo(name: string): IQueryInfo;
        protected _onDbSetHasChangesChanged(eSet: DbSet<IEntityItem, DbContext>): void;
        protected _load(query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON): IPromise<IQueryResult<IEntityItem>>;
        protected _submitChanges(args: {
            fn_onStart: () => void;
            fn_onEnd: () => void;
            fn_onErr: (ex: any) => void;
            fn_onOk: () => void;
        }): void;
        _getInternal(): IInternalDbxtMethods;
        initialize(options: {
            serviceUrl: string;
            permissions?: IPermissionsInfo;
        }): IVoidPromise;
        addOnSubmitError(fn: TEventHandler<DbContext, {
            error: any;
            isHandled: boolean;
        }>, nmspace?: string, context?: IBaseObject): void;
        removeOnSubmitError(nmspace?: string): void;
        getDbSet(name: string): DbSet<IEntityItem, DbContext>;
        getAssociation(name: string): Association;
        submitChanges(): IVoidPromise;
        load(query: DataQuery<IEntityItem>): IPromise<IQueryResult<IEntityItem>>;
        acceptChanges(): void;
        rejectChanges(): void;
        abortRequests(reason?: string, operType?: DATA_OPER): void;
        destroy(): void;
        readonly serviceUrl: string;
        readonly isInitialized: boolean;
        readonly isBusy: boolean;
        readonly isSubmiting: boolean;
        readonly serverTimezone: number;
        readonly dbSets: DbSets;
        readonly serviceMethods: any;
        readonly isHasChanges: boolean;
        readonly requestCount: number;
        requestHeaders: IIndexer<string>;
    }
}
declare module "jriapp_db/entity_aspect" {
    import { IFieldInfo, IVoidPromise, IPromise } from "jriapp_core/shared";
    import { ItemAspect, ITEM_STATUS } from "jriapp_collection/collection";
    import { REFRESH_MODE } from "jriapp_db/const";
    import { DbContext } from "jriapp_db/dbcontext";
    import { IEntityItem, IEntityConstructor, IRowData, IFieldName, IValueChange, IRowInfo } from "jriapp_db/int";
    import { DbSet } from "jriapp_db/dbset";
    export interface IEntityAspectConstructor<TItem extends IEntityItem, TDbContext extends DbContext> {
        new (dbSet: DbSet<TItem, TDbContext>, row: IRowData, names: IFieldName[]): EntityAspect<TItem, TDbContext>;
    }
    export class EntityAspect<TItem extends IEntityItem, TDbContext extends DbContext> extends ItemAspect<TItem> {
        private _srvKey;
        private _isRefreshing;
        private _origVals;
        private _savedStatus;
        constructor(dbSet: DbSet<TItem, TDbContext>, row: IRowData, names: IFieldName[]);
        protected _fakeDestroy(): void;
        protected _initRowInfo(row: IRowData, names: IFieldName[]): void;
        protected _processValues(path: string, values: any[], names: IFieldName[]): void;
        protected _onFieldChanged(fieldName: string, fieldInfo: IFieldInfo): void;
        protected _getValueChange(fullName: string, fieldInfo: IFieldInfo, changedOnly: boolean): IValueChange;
        protected _getValueChanges(changedOnly: boolean): IValueChange[];
        protected _fldChanging(fieldName: string, fieldInfo: IFieldInfo, oldV: any, newV: any): boolean;
        protected _skipValidate(fieldInfo: IFieldInfo, val: any): boolean;
        protected _beginEdit(): boolean;
        protected _endEdit(): boolean;
        protected _cancelEdit(): boolean;
        protected getDbSet(): DbSet<TItem, TDbContext>;
        protected setStatus(v: ITEM_STATUS): void;
        protected getSrvKey(): string;
        _updateKeys(srvKey: string): void;
        _checkCanRefresh(): void;
        _refreshValue(val: any, fullName: string, refreshMode: REFRESH_MODE): void;
        _refreshValues(rowInfo: IRowInfo, refreshMode: REFRESH_MODE): void;
        _getRowInfo(): IRowInfo;
        _getCalcFieldVal(fieldName: string): any;
        _getNavFieldVal(fieldName: string): any;
        _setNavFieldVal(fieldName: string, value: any): void;
        _clearFieldVal(fieldName: string): void;
        _getFieldVal(fieldName: string): any;
        _setFieldVal(fieldName: string, val: any): boolean;
        _acceptChanges(rowInfo?: IRowInfo): void;
        _onAttaching(): void;
        _onAttach(): void;
        deleteItem(): boolean;
        deleteOnSubmit(): boolean;
        acceptChanges(): void;
        rejectChanges(): void;
        submitChanges(): IVoidPromise;
        refresh(): IPromise<TItem>;
        toString(): string;
        destroy(): void;
        readonly entityType: IEntityConstructor<TItem>;
        readonly isCanSubmit: boolean;
        readonly isNew: boolean;
        readonly isDeleted: boolean;
        readonly dbSetName: string;
        readonly serverTimezone: number;
        readonly dbSet: DbSet<TItem, TDbContext>;
        isRefreshing: boolean;
    }
}
declare module "jriapp_db/int" {
    import { DATE_CONVERSION, FILTER_TYPE, DATA_TYPE, SORT_ORDER } from "jriapp_core/const";
    import { IFieldInfo } from "jriapp_core/shared";
    import { ICollectionItem, IPermissions as ICollPermissions, ICollectionOptions, COLL_CHANGE_REASON } from "jriapp_collection/collection";
    import { DELETE_ACTION } from "jriapp_db/const";
    import { EntityAspect } from "jriapp_db/entity_aspect";
    import { DbContext } from "jriapp_db/dbcontext";
    export interface IFieldName {
        n: string;
        p: IFieldName[];
    }
    export interface IEntityItem extends ICollectionItem {
        readonly _aspect: EntityAspect<IEntityItem, DbContext>;
    }
    export interface IEntityConstructor<TItem extends IEntityItem> {
        new (aspect: EntityAspect<TItem, DbContext>): TItem;
    }
    export interface IQueryParamInfo {
        readonly dataType: DATA_TYPE;
        readonly dateConversion: DATE_CONVERSION;
        readonly isArray: boolean;
        readonly isNullable: boolean;
        readonly name: string;
        readonly ordinal: number;
    }
    export interface IQueryInfo {
        isQuery: boolean;
        methodName: string;
        methodResult: boolean;
        parameters: IQueryParamInfo[];
    }
    export interface IValueChange {
        val: any;
        orig: any;
        fieldName: string;
        flags: number;
        nested: IValueChange[];
    }
    export interface IValidationErrorInfo {
        fieldName: string;
        message: string;
    }
    export interface IRowInfo {
        values: IValueChange[];
        changeType: number;
        serverKey: string;
        clientKey: string;
        error: string;
        invalid?: IValidationErrorInfo[];
    }
    export interface IPermissions extends ICollPermissions {
        dbSetName: string;
    }
    export interface IPermissionsInfo {
        serverTimezone: number;
        permissions: IPermissions[];
    }
    export interface IParamInfo {
        parameters: {
            name: string;
            value: any;
        }[];
    }
    export interface IErrorInfo {
        name: string;
        message: string;
    }
    export interface IInvokeRequest {
        methodName: string;
        paramInfo: IParamInfo;
    }
    export interface IInvokeResponse {
        result: any;
        error: IErrorInfo;
    }
    export interface IRefreshRowInfo {
        dbSetName: string;
        rowInfo: IRowInfo;
        error: {
            name: string;
            message: string;
        };
    }
    export interface IDbSetOptions extends ICollectionOptions {
        dbSetName: string;
    }
    export interface IDbSetConstuctorOptions {
        dbContext: DbContext;
        dbSetInfo: IDbSetInfo;
        childAssoc: IAssociationInfo[];
        parentAssoc: IAssociationInfo[];
    }
    export interface IDbSetLoadedArgs<TItem extends IEntityItem> {
        items: TItem[];
    }
    export interface IAssocConstructorOptions {
        dbContext: DbContext;
        parentName: string;
        childName: string;
        onDeleteAction: DELETE_ACTION;
        parentKeyFields: string[];
        childKeyFields: string[];
        parentToChildrenName: string;
        childToParentName: string;
        name: string;
    }
    export interface IAssociationInfo {
        childDbSetName: string;
        childToParentName: string;
        name: string;
        onDeleteAction: number;
        parentDbSetName: string;
        parentToChildrenName: string;
        fieldRels: {
            childField: string;
            parentField: string;
        }[];
    }
    export interface IDbSetInfo {
        dbSetName: string;
        enablePaging: boolean;
        pageSize: number;
        fieldInfos: IFieldInfo[];
    }
    export interface IMetadata {
        associations: IAssociationInfo[];
        dbSets: IDbSetInfo[];
        methods: IQueryInfo[];
        serverTimezone: number;
    }
    export interface ITrackAssoc {
        assocName: string;
        parentKey: string;
        childKey: string;
    }
    export interface IChangeSet {
        dbSets: {
            dbSetName: string;
            rows: IRowInfo[];
        }[];
        error: {
            name: string;
            message: string;
        };
        trackAssocs: ITrackAssoc[];
    }
    export interface IFilterInfo {
        filterItems: {
            fieldName: string;
            kind: FILTER_TYPE;
            values: any[];
        }[];
    }
    export interface ISortInfo {
        sortItems: {
            fieldName: string;
            sortOrder: SORT_ORDER;
        }[];
    }
    export interface IQueryRequest {
        dbSetName: string;
        pageIndex: number;
        pageSize: number;
        pageCount: number;
        isIncludeTotalCount: boolean;
        filterInfo: IFilterInfo;
        sortInfo: ISortInfo;
        paramInfo: IParamInfo;
        queryName: string;
    }
    export interface IRowData {
        k: string;
        v: any[];
    }
    export interface IQueryItems<TItem extends IEntityItem> {
        items: TItem[];
        pos: number[];
    }
    export interface IQueryResult<TItem extends IEntityItem> {
        fetchedItems: TItem[];
        items: TItem[];
        newItems: IQueryItems<TItem>;
        reason: COLL_CHANGE_REASON;
        outOfBandData: any;
    }
    export interface ISubset {
        names: IFieldName[];
        rows: IRowData[];
        dbSetName: string;
    }
    export interface IQueryResponse {
        names: IFieldName[];
        rows: IRowData[];
        dbSetName: string;
        pageIndex: number;
        pageCount: number;
        totalCount: number;
        extraInfo: any;
        error: IErrorInfo;
        subsets: ISubset[];
    }
    export interface ICalcFieldImpl<TItem extends IEntityItem> {
        getFunc: (item: TItem) => any;
    }
    export interface INavFieldImpl<TItem extends IEntityItem> {
        getFunc: (item: TItem) => any;
        setFunc: (v: any) => void;
    }
}
declare module "jriapp_db/dataview" {
    import { SORT_ORDER } from "jriapp_core/const";
    import { IPromise, IFieldInfo, TEventHandler } from "jriapp_core/shared";
    import { Debounce } from "jriapp_utils/utils";
    import { ICollection, ICollectionItem, BaseCollection, COLL_CHANGE_REASON, COLL_CHANGE_OPER, ICollChangedArgs, ICollItemStatusArgs, IErrors, IPermissions } from "jriapp_collection/collection";
    export interface IDataViewOptions<TItem extends ICollectionItem> {
        dataSource: ICollection<TItem>;
        fn_filter?: (item: TItem) => boolean;
        fn_sort?: (item1: TItem, item2: TItem) => number;
        fn_itemsProvider?: (ds: ICollection<TItem>) => TItem[];
    }
    export class DataView<TItem extends ICollectionItem> extends BaseCollection<TItem> {
        private _dataSource;
        protected _fn_filter: (item: TItem) => boolean;
        private _fn_sort;
        private _fn_itemsProvider;
        private _isAddingNew;
        private _objId;
        protected _refreshDebounce: Debounce;
        constructor(options: IDataViewOptions<TItem>);
        protected _getEventNames(): string[];
        protected _destroyItems(): void;
        addOnViewRefreshed(fn: TEventHandler<DataView<TItem>, any>, nmspace?: string): void;
        removeOnViewRefreshed(nmspace?: string): void;
        protected _filterForPaging(items: TItem[]): TItem[];
        protected _onViewRefreshed(args: {}): void;
        protected _refresh(reason: COLL_CHANGE_REASON): void;
        protected _fillItems(data: {
            items: TItem[];
            reason: COLL_CHANGE_REASON;
            clear: boolean;
            isAppend: boolean;
        }): TItem[];
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<TItem>): void;
        protected _onDSStatusChanged(sender: any, args: ICollItemStatusArgs<TItem>): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _onCurrentChanging(newCurrent: TItem): void;
        protected _onPageChanged(): void;
        protected _clear(reason: COLL_CHANGE_REASON, oper: COLL_CHANGE_OPER): void;
        _getStrValue(val: any, fieldInfo: IFieldInfo): string;
        _getErrors(item: TItem): IErrors;
        getItemsWithErrors(): TItem[];
        appendItems(items: TItem[]): TItem[];
        addNew(): TItem;
        removeItem(item: TItem): void;
        sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
        getIsHasErrors(): boolean;
        clear(): void;
        refresh(): void;
        destroy(): void;
        readonly dataSource: ICollection<TItem>;
        isPagingEnabled: boolean;
        readonly permissions: IPermissions;
        fn_filter: (item: TItem) => boolean;
        fn_sort: (item1: TItem, item2: TItem) => number;
        fn_itemsProvider: (ds: BaseCollection<TItem>) => TItem[];
    }
    export type TDataView = DataView<ICollectionItem>;
}
declare module "jriapp_db/child_dataview" {
    import { Debounce } from "jriapp_utils/utils";
    import { COLL_CHANGE_REASON } from "jriapp_collection/collection";
    import { IEntityItem } from "jriapp_db/int";
    import { Association } from "jriapp_db/association";
    import { DataView } from "jriapp_db/dataview";
    export interface IChildDataViewOptions<TItem extends IEntityItem> {
        association: Association;
        fn_filter?: (item: TItem) => boolean;
        fn_sort?: (item1: TItem, item2: TItem) => number;
    }
    export class ChildDataView<TItem extends IEntityItem> extends DataView<TItem> {
        private _parentItem;
        private _association;
        protected _parentDebounce: Debounce;
        constructor(options: IChildDataViewOptions<TItem>);
        protected _refresh(reason: COLL_CHANGE_REASON): void;
        destroy(): void;
        toString(): string;
        parentItem: IEntityItem;
        readonly association: Association;
    }
    export type TChildDataView = ChildDataView<IEntityItem>;
}
declare module "jriapp_db/complexprop" {
    import { IErrorNotification, IFieldInfo, IValidationInfo, TEventHandler } from "jriapp_core/shared";
    import { BaseObject } from "jriapp_core/object";
    import { IEntityItem } from "jriapp_db/int";
    import { EntityAspect } from "jriapp_db/entity_aspect";
    import { DbContext } from "jriapp_db/dbcontext";
    export class BaseComplexProperty extends BaseObject implements IErrorNotification {
        private _name;
        constructor(name: string);
        _getFullPath(path: string): string;
        getName(): string;
        setValue(fullName: string, value: any): void;
        getValue(fullName: string): any;
        getFieldInfo(): IFieldInfo;
        getProperties(): IFieldInfo[];
        getFullPath(name: string): string;
        getEntity(): EntityAspect<IEntityItem, DbContext>;
        getPropertyByName(name: string): IFieldInfo;
        getIsHasErrors(): boolean;
        addOnErrorsChanged(fn: TEventHandler<EntityAspect<IEntityItem, DbContext>, any>, nmspace?: string, context?: any): void;
        removeOnErrorsChanged(nmspace?: string): void;
        getFieldErrors(fieldName: string): IValidationInfo[];
        getAllErrors(): IValidationInfo[];
        getIErrorNotification(): IErrorNotification;
    }
    export class RootComplexProperty extends BaseComplexProperty {
        private _entity;
        constructor(name: string, owner: EntityAspect<IEntityItem, DbContext>);
        _getFullPath(path: string): string;
        setValue(fullName: string, value: any): void;
        getValue(fullName: string): any;
        getFieldInfo(): IFieldInfo;
        getProperties(): IFieldInfo[];
        getEntity(): EntityAspect<IEntityItem, DbContext>;
        getFullPath(name: string): string;
    }
    export class ChildComplexProperty extends BaseComplexProperty {
        private _parent;
        constructor(name: string, parent: BaseComplexProperty);
        _getFullPath(path: string): string;
        setValue(fullName: string, value: any): void;
        getValue(fullName: string): any;
        getFieldInfo(): IFieldInfo;
        getProperties(): IFieldInfo[];
        getParent(): BaseComplexProperty;
        getRootProperty(): RootComplexProperty;
        getFullPath(name: string): string;
        getEntity(): EntityAspect<IEntityItem, DbContext>;
    }
}
declare module "jriapp_db" {
    export { IFieldName, IEntityItem, IPermissions, IQueryResult, IDbSetLoadedArgs, IErrorInfo, IMetadata, IDbSetConstuctorOptions, IEntityConstructor, IValidationErrorInfo, IPermissionsInfo, IFilterInfo, ISortInfo, IRowData } from "jriapp_db/int";
    export { DbSet, TDbSet, IDbSetConstructor, IInternalDbSetMethods } from "jriapp_db/dbset";
    export * from "jriapp_db/dataview";
    export * from "jriapp_db/child_dataview";
    export * from "jriapp_db/association";
    export { REFRESH_MODE, DELETE_ACTION, DATA_OPER, FLAGS } from "jriapp_db/const";
    export * from "jriapp_db/dbcontext";
    export * from "jriapp_db/dbsets";
    export * from "jriapp_db/dataquery";
    export * from "jriapp_db/entity_aspect";
    export * from "jriapp_db/error";
    export * from "jriapp_db/complexprop";
}
