/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    FIELD_TYPE, DATE_CONVERSION, DATA_TYPE, SORT_ORDER, COLL_CHANGE_REASON
} from "jriapp_shared/collection/const";
import {
    IIndexer, IVoidPromise, AbortError, IBaseObject, TEventHandler, LocaleERRS as ERRS,
    BaseObject, Utils, WaitQueue, Lazy, IPromiseState, IStatefulPromise, IAbortablePromise,
    PromiseState, IDeferred
} from "jriapp_shared";
import { valueUtils } from "jriapp_shared/collection/utils";
import {
    IEntityItem, IRefreshRowInfo, IQueryResult, IQueryInfo, IAssociationInfo, IAssocConstructorOptions,
    IPermissionsInfo, IPermissions, IInvokeRequest, IInvokeResponse, IQueryRequest, IQueryResponse, ITrackAssoc,
    IChangeSet, IRowInfo, IQueryParamInfo, IRowData, ISubset
} from "./int";
import { PROP_NAME, DATA_OPER, REFRESH_MODE } from "./const";
import { DbSet } from "./dbset";
import { DbSets } from "./dbsets";
import { Association } from "./association";
import { DataQuery, TDataQuery } from "./dataquery";
import {
    AccessDeniedError, ConcurrencyError, SvcValidationError,
    DataOperationError, SubmitError
} from "./error";

const utils = Utils, http = utils.http, checks = utils.check, strUtils = utils.str,
    coreUtils = utils.core, ERROR = utils.err, valUtils = valueUtils, _async = utils.defer;

const DATA_SVC_METH = {
    Invoke: "invoke",
    Query: "query",
    Permissions: "permissions",
    Submit: "save",
    Refresh: "refresh"
};

function __checkError(svcError: { name: string; message?: string; }, oper: DATA_OPER) {
    if (!svcError)
        return;
    if (ERROR.checkIsDummy(svcError))
        return;
    switch (svcError.name) {
        case "AccessDeniedException":
            throw new AccessDeniedError(ERRS.ERR_ACCESS_DENIED, oper);
        case "ConcurrencyException":
            throw new ConcurrencyError(ERRS.ERR_CONCURRENCY, oper);
        case "ValidationException":
            throw new SvcValidationError(strUtils.format(ERRS.ERR_SVC_VALIDATION,
                svcError.message), oper);
        case "DomainServiceException":
            throw new DataOperationError(strUtils.format(ERRS.ERR_SVC_ERROR,
                svcError.message), oper);
        default:
            throw new DataOperationError(strUtils.format(ERRS.ERR_UNEXPECTED_SVC_ERROR,
                svcError.message), oper);
    }
}

export interface IInternalDbxtMethods {
    onItemRefreshed(res: IRefreshRowInfo, item: IEntityItem): void;
    refreshItem(item: IEntityItem): IStatefulPromise<IEntityItem>;
    getQueryInfo(name: string): IQueryInfo;
    onDbSetHasChangesChanged(eSet: DbSet<IEntityItem, DbContext>): void;
    load(query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON): IStatefulPromise<IQueryResult<IEntityItem>>;
}

interface IRequestPromise {
    req: IAbortablePromise<any>;
    operType: DATA_OPER;
    name: string;
}

const DBCTX_EVENTS = {
    submit_err: "submit_error"
};

export class DbContext extends BaseObject {
    private _requestHeaders: IIndexer<string>;
    private _requests: IRequestPromise[];
    protected _initState: IStatefulPromise<any>;
    protected _dbSets: DbSets;
    //_svcMethods: { [methodName: string]: (args: { [paramName: string]: any; }) => IStatefulPromise<any>; };
    protected _svcMethods: any;
    //_assoc: IIndexer<() => Association>;
    protected _assoc: any;
    private _arrAssoc: Association[];
    private _queryInf: { [queryName: string]: IQueryInfo; };
    private _serviceUrl: string;
    private _isSubmiting: boolean;
    private _isHasChanges: boolean;
    private _pendingSubmit: { promise: IVoidPromise; };
    private _serverTimezone: number;
    private _waitQueue: WaitQueue;
    private _internal: IInternalDbxtMethods;

    constructor() {
        super();
        const self = this;
        this._initState = null;
        this._requestHeaders = {};
        this._requests = [];
        this._dbSets = null;
        this._svcMethods = {};
        this._assoc = {};
        this._arrAssoc = [];
        this._queryInf = {};
        this._serviceUrl = null;
        this._isSubmiting = false;
        this._isHasChanges = false;
        this._pendingSubmit = null;
        //at first init it with client side timezone
        this._serverTimezone = coreUtils.get_timeZoneOffset();
        this._waitQueue = new WaitQueue(this);
        this._internal = {
            onItemRefreshed: (res: IRefreshRowInfo, item: IEntityItem) => {
                self._onItemRefreshed(res, item);
            },
            refreshItem: (item: IEntityItem) => {
                return self._refreshItem(item);
            },
            getQueryInfo: (name: string) => {
                return self._getQueryInfo(name);
            },
            onDbSetHasChangesChanged: (eSet: DbSet<IEntityItem, DbContext>) => {
                self._onDbSetHasChangesChanged(eSet);
            },
            load: (query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON) => {
                return self._load(query, reason);
            }
        };
        this.addOnPropertyChange(PROP_NAME.isSubmiting, (s, a) => { self.raisePropertyChanged(PROP_NAME.isBusy); });
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [DBCTX_EVENTS.submit_err].concat(base_events);
    }
    protected _initDbSets() {
        if (this.isInitialized)
            throw new Error(ERRS.ERR_DOMAIN_CONTEXT_INITIALIZED);
    }
    protected _initAssociations(associations: IAssociationInfo[]) {
        let self = this;
        associations.forEach(function (assoc) {
            self._initAssociation(assoc);
        });
    }
    protected _initMethods(methods: IQueryInfo[]) {
        let self = this;
        methods.forEach(function (info) {
            if (info.isQuery)
                self._queryInf[info.methodName] = info;
            else {
                //service method info
                self._initMethod(info);
            }
        });
    }
    protected _updatePermissions(info: IPermissionsInfo) {
        let self = this;
        this._serverTimezone = info.serverTimezone;
        info.permissions.forEach(function (perms) {
            self.getDbSet(perms.dbSetName)._getInternal().updatePermissions(perms);
        });
    }
    protected _initAssociation(assoc: IAssociationInfo) {
        const self = this, options: IAssocConstructorOptions = {
            dbContext: self,
            parentName: assoc.parentDbSetName,
            childName: assoc.childDbSetName,
            onDeleteAction: assoc.onDeleteAction,
            parentKeyFields: assoc.fieldRels.map(function (f) {
                return f.parentField;
            }),
            childKeyFields: assoc.fieldRels.map(function (f) {
                return f.childField;
            }),
            parentToChildrenName: assoc.parentToChildrenName,
            childToParentName: assoc.childToParentName,
            name: assoc.name
        }, name = "get" + assoc.name;
        const lazy = new Lazy<Association>(() => {
            const res = new Association(options);
            self._arrAssoc.push(res);
            return res;
        });
        this._assoc[name] = () => lazy.Value;
    }
    protected _initMethod(methodInfo: IQueryInfo) {
        const self = this;
        //function expects method parameters
        this._svcMethods[methodInfo.methodName] = function (args: { [paramName: string]: any; }) {
            const deferred = _async.createDeferred<any>(), callback = function (res: { result: any; error: any; }) {
                if (!res.error) {
                    deferred.resolve(res.result);
                }
                else {
                    deferred.reject();
                }
            };

            try {
                const data = self._getMethodParams(methodInfo, args);
                self._invokeMethod(methodInfo, data, callback);
            } catch (ex) {
                if (!ERROR.checkIsDummy(ex)) {
                    self.handleError(ex, self);
                    callback({ result: null, error: ex });
                }
            }

            return deferred.promise();
        };
    }
    protected _addRequestPromise(req: IAbortablePromise<any>, operType: DATA_OPER, name?: string) {
        let self = this, item: IRequestPromise = { req: req, operType: operType, name: name },
            cnt = self._requests.length, _isBusy = cnt > 0;

        self._requests.push(item);
        req.always(() => {
            utils.arr.remove(self._requests, item);
            self.raisePropertyChanged(PROP_NAME.requestCount);
            if (self._requests.length === 0)
                self.raisePropertyChanged(PROP_NAME.isBusy);
        });
        if (cnt !== self._requests.length)
            self.raisePropertyChanged(PROP_NAME.requestCount);
        if (_isBusy !== (self._requests.length > 0))
            self.raisePropertyChanged(PROP_NAME.isBusy);
    }
    protected _tryAbortRequest(operType: DATA_OPER, name: string) {
        let reqs = this._requests.filter((req) => { return req.operType === operType && req.name === name; });
        reqs.forEach((r) => { r.req.abort(); });
    }
    protected _getMethodParams(methodInfo: IQueryInfo, args: { [paramName: string]: any; }): IInvokeRequest {
        let self = this, methodName: string = methodInfo.methodName,
            data: IInvokeRequest = { methodName: methodName, paramInfo: { parameters: [] } };
        let i: number, parameterInfos = methodInfo.parameters, len = parameterInfos.length, pinfo: IQueryParamInfo, val: any, value: any;
        if (!args)
            args = {};
        for (i = 0; i < len; i += 1) {
            pinfo = parameterInfos[i];
            val = args[pinfo.name];
            if (!pinfo.isNullable && !pinfo.isArray && !(pinfo.dataType === DATA_TYPE.String || pinfo.dataType === DATA_TYPE.Binary) && checks.isNt(val)) {
                throw new Error(strUtils.format(ERRS.ERR_SVC_METH_PARAM_INVALID, pinfo.name, val, methodInfo.methodName));
            }
            if (checks.isFunc(val)) {
                throw new Error(strUtils.format(ERRS.ERR_SVC_METH_PARAM_INVALID, pinfo.name, val, methodInfo.methodName));
            }
            if (pinfo.isArray && !checks.isNt(val) && !checks.isArray(val)) {
                val = [val];
            }
            value = null;
            //byte arrays are optimized for serialization
            if (pinfo.dataType === DATA_TYPE.Binary && checks.isArray(val)) {
                value = JSON.stringify(val);
            }
            else if (checks.isArray(val)) {
                let arr = new Array(val.length);
                for (let k = 0; k < val.length; k += 1) {
                    //first convert all values to string
                    arr[k] = valUtils.stringifyValue(val[k], pinfo.dateConversion, pinfo.dataType, self.serverTimezone);
                }
                value = JSON.stringify(arr);
            }
            else
                value = valUtils.stringifyValue(val, pinfo.dateConversion, pinfo.dataType, self.serverTimezone);

            data.paramInfo.parameters.push({ name: pinfo.name, value: value });
        }

        return data;
    }
    protected _invokeMethod(methodInfo: IQueryInfo, data: IInvokeRequest, callback: (res: { result: any; error: any; }) => void) {
        let self = this, operType = DATA_OPER.Invoke, postData: string, invokeUrl: string;
        let fn_onComplete = function (res: IInvokeResponse) {
            if (self.getIsDestroyCalled())
                return;
            try {
                if (!res)
                    throw new Error(strUtils.format(ERRS.ERR_UNEXPECTED_SVC_ERROR, "operation result is empty"));
                __checkError(res.error, operType);
                callback({ result: res.result, error: null });
            } catch (ex) {
                if (ERROR.checkIsDummy(ex)) {
                    return;
                }
                self._onDataOperError(ex, operType);
                callback({ result: null, error: ex });
            }
        };

        try {
            postData = JSON.stringify(data);
            invokeUrl = this._getUrl(DATA_SVC_METH.Invoke);
            let req_promise = http.postAjax(invokeUrl, postData, self.requestHeaders);
            self._addRequestPromise(req_promise, operType);

            req_promise.then(function (res: string) {
                return _async.parseJSON(res);
            }).then(function (res: IInvokeResponse) { //success
                fn_onComplete(res);
            }, function (err) { //error
                fn_onComplete({ result: null, error: err });
            });
        }
        catch (ex) {
            if (ERROR.checkIsDummy(ex)) {
                ERROR.throwDummy(ex);
            }
            this._onDataOperError(ex, operType);
            callback({ result: null, error: ex });
            ERROR.throwDummy(ex);
        }
    }
    protected _loadFromCache(query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON): IStatefulPromise<IQueryResult<IEntityItem>> {
        let self = this, defer = _async.createDeferred<IQueryResult<IEntityItem>>();
        setTimeout(() => {
            if (self.getIsDestroyCalled()) {
                defer.reject(new AbortError());
                return;
            }
            let operType = DATA_OPER.Query, dbSet = query.dbSet, queryRes: IQueryResult<IEntityItem>;
            try {
                queryRes = dbSet._getInternal().fillFromCache({ reason: reason, query: query });
                defer.resolve(queryRes);
            } catch (ex) {
                defer.reject(ex);
            }
        }, 0);
        return defer.promise();
    }
    protected _loadSubsets(res: IQueryResponse, isClearAll: boolean) {
        let self = this, isHasSubsets = checks.isArray(res.subsets) && res.subsets.length > 0;
        if (!isHasSubsets)
            return;
        res.subsets.forEach(function (subset) {
            let dbSet = self.getDbSet(subset.dbSetName);
            dbSet.fillData(subset, !isClearAll);
        });
    }
    protected _onLoaded(res: IQueryResponse, query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON): IStatefulPromise<IQueryResult<IEntityItem>> {
        let self = this, defer = _async.createDeferred<IQueryResult<IEntityItem>>();
        setTimeout(() => {
            if (self.getIsDestroyCalled()) {
                defer.reject(new AbortError());
                return;
            }

            let operType = DATA_OPER.Query, dbSetName: string, dbSet: DbSet<IEntityItem, DbContext>,
                loadRes: IQueryResult<IEntityItem>;
            try {
                if (checks.isNt(res))
                    throw new Error(strUtils.format(ERRS.ERR_UNEXPECTED_SVC_ERROR, "null result"));
                dbSetName = res.dbSetName;
                dbSet = self.getDbSet(dbSetName);
                if (checks.isNt(dbSet))
                    throw new Error(strUtils.format(ERRS.ERR_DBSET_NAME_INVALID, dbSetName));
                __checkError(res.error, operType);
                let isClearAll = (!!query && query.isClearPrevData);

                loadRes = dbSet._getInternal().fillFromService(
                    {
                        res: res,
                        reason: reason,
                        query: query,
                        onFillEnd: () => { self._loadSubsets(res, isClearAll); }
                    });
                defer.resolve(loadRes);
            } catch (ex) {
                defer.reject(ex);
            }
        }, 0);

        return defer.promise();
    }
    protected _dataSaved(res: IChangeSet) {
        let self = this, submitted: IEntityItem[] = [], notvalid: IEntityItem[] = [];
        try {
            try {
                __checkError(res.error, DATA_OPER.Submit);
            }
            catch (ex) {
                res.dbSets.forEach(function (jsDB) {
                    let eSet = self._dbSets.getDbSet(jsDB.dbSetName);
                    jsDB.rows.forEach(function (row) {
                        let item = eSet.getItemByKey(row.clientKey);
                        if (!item) {
                            throw new Error(strUtils.format(ERRS.ERR_KEY_IS_NOTFOUND, row.clientKey));
                        }
                        submitted.push(item);
                        if (!!row.invalid) {
                            eSet._getInternal().setItemInvalid(row);
                            notvalid.push(item);
                        }
                    });
                });
                throw new SubmitError(ex, submitted, notvalid);
            }

            res.dbSets.forEach(function (jsDB) {
                self._dbSets.getDbSet(jsDB.dbSetName)._getInternal().commitChanges(jsDB.rows);
            });
        }
        catch (ex) {
            if (ERROR.checkIsDummy(ex)) {
                ERROR.throwDummy(ex);
            }
            this._onSubmitError(ex);
            ERROR.throwDummy(ex);
        }
    }
    protected _getChanges(): IChangeSet {
        let changeSet: IChangeSet = { dbSets: [], error: null, trackAssocs: [] };
        this._dbSets.arrDbSets.forEach(function (eSet) {
            eSet.endEdit();
            let changes: IRowInfo[] = eSet._getInternal().getChanges();
            if (changes.length === 0)
                return;
            //it needs to apply updates in parent-child relationship order on the server
            //and provides child to parent map of the keys for the new entities
            let trackAssoc: ITrackAssoc[] = eSet._getInternal().getTrackAssocInfo();
            let jsDB = { dbSetName: eSet.dbSetName, rows: changes };
            changeSet.dbSets.push(jsDB);
            changeSet.trackAssocs = changeSet.trackAssocs.concat(trackAssoc);
        });
        return changeSet;
    }
    protected _getUrl(action: string): string {
        let loadUrl = this.serviceUrl;
        if (!strUtils.endsWith(loadUrl, "/"))
            loadUrl = loadUrl + "/";
        loadUrl = loadUrl + [action, ""].join("/");
        return loadUrl;
    }
    protected _onDataOperError(ex: any, oper: DATA_OPER): boolean {
        if (ERROR.checkIsDummy(ex))
            return true;
        let er: any;
        if (ex instanceof DataOperationError)
            er = ex;
        else
            er = new DataOperationError(ex, oper);
        return this.handleError(er, this);
    }
    protected _onSubmitError(error: any) {
        let args = { error: error, isHandled: false };
        this.raiseEvent(DBCTX_EVENTS.submit_err, args);
        if (!args.isHandled) {
            this.rejectChanges();
            this._onDataOperError(error, DATA_OPER.Submit);
        }
    }
    protected waitForNotBusy(callback: () => void) {
        this._waitQueue.enQueue({
            prop: PROP_NAME.isBusy,
            groupName: null,
            predicate: function (val: any) {
                return !val;
            },
            action: callback,
            actionArgs: []
        });
    }
    protected waitForNotSubmiting(callback: () => void) {
        this._waitQueue.enQueue({
            prop: PROP_NAME.isSubmiting,
            predicate: function (val: any) {
                return !val;
            },
            action: callback,
            actionArgs: [],
            groupName: "submit",
            lastWins: true
        });
    }
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
    }) {
        const self = this, oldQuery = context.dbSet.query,
            loadPageCount = context.loadPageCount,
            isPagingEnabled = context.isPagingEnabled;

        let range: { start: number; end: number; cnt: number; }, pageCount = 1,
            pageIndex = context.pageIndex;

        context.fn_onStart();
        //restore pageIndex
        context.query.pageIndex = pageIndex;
        context.dbSet._getInternal().beforeLoad(context.query, oldQuery);
        //sync pageIndex
        pageIndex = context.query.pageIndex;

        if (loadPageCount > 1 && isPagingEnabled) {
            if (context.query._getInternal().isPageCached(pageIndex)) {
                let loadPromise = self._loadFromCache(context.query, context.reason);
                loadPromise.then((loadRes) => {
                    if (self.getIsDestroyCalled())
                        return;
                    context.fn_onOK(loadRes);
                }, (err) => {
                    if (self.getIsDestroyCalled())
                        return;
                    context.fn_onErr(err);
                });
                return;
            }
            else {
                range = context.query._getInternal().getCache().getNextRange(pageIndex);
                pageIndex = range.start;
                pageCount = range.cnt;
            }
        }

        const requestInfo: IQueryRequest = {
            dbSetName: context.dbSetName,
            pageIndex: context.query.isPagingEnabled ? pageIndex : -1,
            pageSize: context.query.pageSize,
            pageCount: pageCount,
            isIncludeTotalCount: context.query.isIncludeTotalCount,
            filterInfo: context.query.filterInfo,
            sortInfo: context.query.sortInfo,
            paramInfo: self._getMethodParams(context.query._getInternal().getQueryInfo(), context.query.params).paramInfo,
            queryName: context.query.queryName
        };

        let req_promise = http.postAjax(self._getUrl(DATA_SVC_METH.Query), JSON.stringify(requestInfo), self.requestHeaders);
        self._addRequestPromise(req_promise, DATA_OPER.Query, requestInfo.dbSetName);
        req_promise.then(function (res: string) {
            return _async.parseJSON(res);
        }).then(function (response: IQueryResponse) {
            return self._onLoaded(response, context.query, context.reason);
        }).then((loadRes) => {
            if (self.getIsDestroyCalled())
                return;
            context.fn_onOK(loadRes);
        }, (err) => {
            if (self.getIsDestroyCalled())
                return;
            context.fn_onErr(err);
        });
    }
    protected _onItemRefreshed(res: IRefreshRowInfo, item: IEntityItem): void {
        const operType = DATA_OPER.Refresh;
        try {
            __checkError(res.error, operType);
            if (!res.rowInfo) {
                item._aspect.dbSet.removeItem(item);
                item.destroy();
                throw new Error(ERRS.ERR_ITEM_DELETED_BY_ANOTHER_USER);
            }
            else
                item._aspect._refreshValues(res.rowInfo, REFRESH_MODE.MergeIntoCurrent);
        }
        catch (ex) {
            if (ERROR.checkIsDummy(ex)) {
                ERROR.throwDummy(ex);
            }
            this._onDataOperError(ex, operType);
            ERROR.throwDummy(ex);
        }
    }
    protected _loadRefresh(args: {
        item: IEntityItem;
        dbSet: DbSet<IEntityItem, DbContext>;
        fn_onStart: () => void;
        fn_onEnd: () => void;
        fn_onErr: (ex: any) => void;
        fn_onOK: (res: IRefreshRowInfo) => void;
    }) {
        let self = this;
        const operType = DATA_OPER.Refresh;
        args.fn_onStart();
        try {
            let request: IRefreshRowInfo = {
                dbSetName: args.item._aspect.dbSetName,
                rowInfo: args.item._aspect._getRowInfo(),
                error: null
            };

            args.item._aspect._checkCanRefresh();
            let url = self._getUrl(DATA_SVC_METH.Refresh),
                req_promise = http.postAjax(url, JSON.stringify(request), self.requestHeaders);

            self._addRequestPromise(req_promise, operType);

            req_promise.then((res: string) => {
                return _async.parseJSON(res);
            }).then((res: IRefreshRowInfo) => { //success
                if (self.getIsDestroyCalled())
                    return;
                args.fn_onOK(res);
            }, (err) => { //error
                if (self.getIsDestroyCalled())
                    return;
                args.fn_onErr(err);
            });
        }
        catch (ex) {
            args.fn_onErr(ex);
        }
    }
    protected _refreshItem(item: IEntityItem): IStatefulPromise<IEntityItem> {
        const self = this, deferred = _async.createDeferred<IEntityItem>();
        const context = {
            item: item,
            dbSet: item._aspect.dbSet,
            fn_onStart: function () {
                context.item._aspect._setIsRefreshing(true);
                context.dbSet._setIsLoading(true);
            },
            fn_onEnd: function () {
                context.dbSet._setIsLoading(false);
                context.item._aspect._setIsRefreshing(false);
            },
            fn_onErr: function (ex: any) {
                try {
                    context.fn_onEnd();
                    self._onDataOperError(ex, DATA_OPER.Refresh);
                }
                finally {
                    deferred.reject();
                }
            },
            fn_onOK: function (res: IRefreshRowInfo) {
                try {
                    self._onItemRefreshed(res, item);
                    context.fn_onEnd();
                }
                finally {
                    deferred.resolve(item);
                }
            }
        };

        context.dbSet.waitForNotBusy(() => self._loadRefresh(context), item._key);
        return deferred.promise();
    }
    protected _getQueryInfo(name: string): IQueryInfo {
        return this._queryInf[name];
    }
    protected _onDbSetHasChangesChanged(eSet: DbSet<IEntityItem, DbContext>): void {
        let old = this._isHasChanges, test: DbSet<IEntityItem, DbContext>;
        this._isHasChanges = false;
        if (eSet.isHasChanges) {
            this._isHasChanges = true;
        }
        else {
            for (let i = 0, len = this._dbSets.arrDbSets.length; i < len; i += 1) {
                test = this._dbSets.arrDbSets[i];
                if (test.isHasChanges) {
                    this._isHasChanges = true;
                    break;
                }
            }
        }
        if (this._isHasChanges !== old) {
            this.raisePropertyChanged(PROP_NAME.isHasChanges);
        }
    }
    protected _load(query: DataQuery<IEntityItem>, reason: COLL_CHANGE_REASON): IStatefulPromise<IQueryResult<IEntityItem>> {
        if (!query) {
            throw new Error(ERRS.ERR_DB_LOAD_NO_QUERY);
        }

        const self = this, deferred = _async.createDeferred<IQueryResult<IEntityItem>>();

        const context = {
            query: query,
            reason: reason,
            loadPageCount: query.loadPageCount,
            pageIndex: query.pageIndex,
            isPagingEnabled: query.isPagingEnabled,
            dbSetName: query.dbSetName,
            dbSet: self.getDbSet(query.dbSetName),
            fn_onStart: function () {
                context.dbSet._setIsLoading(true);
            },
            fn_onEnd: function () {
                context.dbSet._setIsLoading(false);
            },
            fn_onOK: function (res: IQueryResult<IEntityItem>) {
                try {
                    context.fn_onEnd();
                }
                finally {
                    deferred.resolve(res);
                }
            },
            fn_onErr: function (ex: any) {
                try {
                    context.fn_onEnd();
                    self._onDataOperError(ex, DATA_OPER.Query);
                }
                finally {
                    deferred.reject();
                }
            }
        };

        if (query.isClearPrevData)
            self._tryAbortRequest(DATA_OPER.Query, context.dbSetName);

        context.dbSet.waitForNotBusy(() => {
            try {
                self._loadInternal(context);
            }
            catch (err) {
                context.fn_onErr(err);
            }
        }, query.isClearPrevData ? context.dbSetName : null);

        return deferred.promise();
    }
    protected _submitChanges(args: {
        fn_onStart: () => void;
        fn_onEnd: () => void;
        fn_onErr: (ex: any) => void;
        fn_onOk: () => void;
    }): void {
        let self = this, changeSet: IChangeSet;
        args.fn_onStart();
        changeSet = self._getChanges();

        if (changeSet.dbSets.length === 0) {
            args.fn_onOk();
            return;
        }

        let req_promise = http.postAjax(self._getUrl(DATA_SVC_METH.Submit), JSON.stringify(changeSet), self.requestHeaders);
        self._addRequestPromise(req_promise, DATA_OPER.Submit);
        req_promise.then((res: string) => {
            return _async.parseJSON(res);
        }).then(function (res: IChangeSet) {
            if (self.getIsDestroyCalled())
                return;
            self._dataSaved(res);
        }).then(() => {
            if (self.getIsDestroyCalled())
                return;
            args.fn_onOk();
        }, (er) => {
            if (self.getIsDestroyCalled())
                return;
            args.fn_onErr(er);
        });
    }
    _getInternal(): IInternalDbxtMethods {
        return this._internal;
    }
    initialize(options: {
        serviceUrl: string;
        permissions?: IPermissionsInfo;
    }): IVoidPromise {
        if (!!this._initState) {
            return this._initState;
        }
        const self = this, operType = DATA_OPER.Init, deferred = _async.createDeferred<any>();

        this._initState = deferred.promise();
        this._initState.then(() => {
            if (self.getIsDestroyCalled())
                return;
            self.raisePropertyChanged(PROP_NAME.isInitialized);
        }, (err) => {
            if (self.getIsDestroyCalled())
                return;
            self._onDataOperError(err, operType);
        });

        let opts = coreUtils.merge(options, {
            serviceUrl: <string>null,
            permissions: <IPermissionsInfo>null
        }), loadUrl: string;

        try {
            if (!checks.isString(opts.serviceUrl)) {
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "serviceUrl", opts.serviceUrl));
            }
            this._serviceUrl = opts.serviceUrl;
            this._initDbSets();

            if (!!opts.permissions) {
                self._updatePermissions(opts.permissions);
                deferred.resolve();
                return this._initState;
            }

            //initialize by obtaining metadata from the data service by ajax call
            loadUrl = this._getUrl(DATA_SVC_METH.Permissions);
        }
        catch (ex) {
            return deferred.reject(ex);
        }

        let ajax_promise = http.getAjax(loadUrl, self.requestHeaders);
        let res_promise = ajax_promise.then((permissions: string) => {
            if (self.getIsDestroyCalled())
                return;
            self._updatePermissions(JSON.parse(permissions));
        });

        deferred.resolve(res_promise);
        this._addRequestPromise(ajax_promise, operType);
        return this._initState;
    }
    addOnSubmitError(fn: TEventHandler<DbContext, { error: any; isHandled: boolean; }>, nmspace?: string, context?: IBaseObject): void {
        this._addHandler(DBCTX_EVENTS.submit_err, fn, nmspace, context);
    }
    removeOnSubmitError(nmspace?: string): void {
        this._removeHandler(DBCTX_EVENTS.submit_err, nmspace);
    }
    getDbSet(name: string) {
        return this._dbSets.getDbSet(name);
    }
    getAssociation(name: string): Association {
        const name2 = "get" + name, fn = this._assoc[name2];
        if (!fn)
            throw new Error(strUtils.format(ERRS.ERR_ASSOC_NAME_INVALID, name));
        return fn();
    }
    submitChanges(): IVoidPromise {
        const self = this;

        //don't submit when another submit is already in the queue
        if (!!this._pendingSubmit) {
            return this._pendingSubmit.promise;
        }

        const deferred = _async.createDeferred<void>(), submitState = { promise: deferred.promise() };
        this._pendingSubmit = submitState;

        const context = {
            fn_onStart: function () {
                if (!self._isSubmiting) {
                    self._isSubmiting = true;
                    self.raisePropertyChanged(PROP_NAME.isSubmiting);
                }
                //allow to post new submit
                self._pendingSubmit = null;
            },
            fn_onEnd: function () {
                if (self._isSubmiting) {
                    self._isSubmiting = false;
                    self.raisePropertyChanged(PROP_NAME.isSubmiting);
                }
            },
            fn_onErr: function (ex: any) {
                try {
                    context.fn_onEnd();
                    self._onSubmitError(ex);
                }
                finally {
                    deferred.reject();
                }
            },
            fn_onOk: function () {
                try {
                    context.fn_onEnd();
                }
                finally {
                    deferred.resolve();
                }
            }
        };


        self.waitForNotBusy(() => {
            try {
                self._submitChanges(context);
            }
            catch (err) {
                context.fn_onErr(err);
            }
        });

        return submitState.promise;
    }
    load(query: DataQuery<IEntityItem>): IStatefulPromise<IQueryResult<IEntityItem>> {
        return this._load(query, COLL_CHANGE_REASON.None);
    }
    acceptChanges(): void {
        this._dbSets.arrDbSets.forEach(function (eSet) {
            eSet.acceptChanges();
        });
    }
    rejectChanges(): void {
        this._dbSets.arrDbSets.forEach(function (eSet) {
            eSet.rejectChanges();
        });
    }
    abortRequests(reason?: string, operType?: DATA_OPER): void {
        if (checks.isNt(operType))
            operType = DATA_OPER.None;
        let arr = this._requests.filter((a) => {
            return operType === DATA_OPER.None ? true : (a.operType === operType);
        });

        for (let i = 0; i < arr.length; i += 1) {
            let item = arr[i];
            item.req.abort(reason);
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.abortRequests();
        this._waitQueue.destroy();
        this._waitQueue = null;
        this._arrAssoc.forEach(function (assoc) {
            assoc.destroy();
        });
        this._arrAssoc = [];
        this._assoc = {};
        this._dbSets.destroy();
        this._dbSets = null;
        this._svcMethods = {};
        this._queryInf = {};
        this._serviceUrl = null;
        this._initState = null;
        this._isSubmiting = false;
        this._isHasChanges = false;
        super.destroy();
    }
    get serviceUrl() { return this._serviceUrl; }
    get isInitialized() { return !!this._initState && this._initState.state() === PromiseState.Resolved; }
    get isBusy() { return (this.requestCount > 0) || this.isSubmiting; }
    get isSubmiting() { return this._isSubmiting; }
    get serverTimezone() { return this._serverTimezone; }
    get dbSets() { return this._dbSets; }
    get serviceMethods() { return this._svcMethods; }
    get isHasChanges() { return this._isHasChanges; }
    get requestCount() { return this._requests.length; }
    get requestHeaders() { return this._requestHeaders; }
    set requestHeaders(v) { this._requestHeaders = v; }
}